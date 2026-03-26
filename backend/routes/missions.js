const express = require('express')
const { v4: uuidv4 } = require('uuid')
const { authenticate, requireClient, requireAgent } = require('../middleware/auth')
const supabase = require('../services/supabase')

const router = express.Router()

// Tarifs officiels — source de vérité côté serveur
const TARIFS_HEURE = {
  garde_corps_vip: 150000,
  protection_evenement: 100000,
  surveillance_site: 50000,
  securite_residentielle: 60000,
  escorte_securisee: 120000,
  mission_sur_mesure: 80000,
}
const MIN_HEURES = 3
const COMMISSION_PLATFORM = 0.25
const FRAIS_SERVICE_CLIENT = 0.05

function calculerPrix(type, duree, urgence) {
  const tarifHeure = TARIFS_HEURE[type]
  if (!tarifHeure) throw new Error(`Type de mission invalide: ${type}`)
  if (duree < MIN_HEURES) throw new Error(`Durée minimum: ${MIN_HEURES} heures`)

  const prixBase = tarifHeure * duree
  const majorationMap = { urgent: 0.25, immediat: 0.50, normal: 0 }
  const majoration = majorationMap[urgence] ?? 0
  const prixMajore = Math.round(prixBase * (1 + majoration))
  const fraisService = Math.round(prixMajore * FRAIS_SERVICE_CLIENT)
  const prixTotal = prixMajore + fraisService
  const commissionPlateforme = Math.round(prixMajore * COMMISSION_PLATFORM)
  const partAgent = prixMajore - commissionPlateforme

  return { prixTotal, commissionPlateforme, partAgent, fraisService }
}

/**
 * POST /api/missions
 * Créer une nouvelle mission
 */
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { agent_id, type, duree_heures, date_mission, adresse, description, urgence = 'normal' } = req.body

    if (!agent_id || !type || !duree_heures || !date_mission || !adresse) {
      return res.status(400).json({ error: 'Champs obligatoires manquants' })
    }

    const { prixTotal, commissionPlateforme, partAgent, fraisService } = calculerPrix(type, Number(duree_heures), urgence)

    if (!supabase) {
      return res.json({
        success: true,
        mission: {
          id: uuidv4(), agent_id, type, duree_heures, date_mission, adresse,
          description, urgence, statut: 'pending', prix_total: prixTotal,
          commission_platform: commissionPlateforme, agent_part: partAgent,
          created_at: new Date().toISOString(),
        },
      })
    }

    const { data, error } = await supabase.from('missions').insert({
      id: uuidv4(),
      client_id: req.user.id,
      agent_id,
      type,
      title: `${type.replace(/_/g, ' ')} — ${adresse}`,
      description,
      duree_heures: Number(duree_heures),
      date_mission,
      adresse,
      urgence,
      statut: 'pending',
      prix_total: prixTotal,
      commission_platform: commissionPlateforme,
      agent_part: partAgent,
    }).select().single()

    if (error) throw new Error(error.message)

    // Notifier l'agent (via Supabase Realtime — automatique)
    res.status(201).json({ success: true, mission: data })
  } catch (e) {
    next(e)
  }
})

/**
 * GET /api/missions/:id
 */
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    if (!supabase) return res.json({ mission: null })

    const { data, error } = await supabase
      .from('missions')
      .select(`*, agents(*, users(name, phone, photo_url)), clients(users(name, phone))`)
      .eq('id', req.params.id)
      .single()

    if (error || !data) return res.status(404).json({ error: 'Mission non trouvée' })
    res.json({ mission: data })
  } catch (e) { next(e) }
})

/**
 * GET /api/missions — Liste les missions de l'utilisateur
 */
router.get('/', authenticate, async (req, res, next) => {
  try {
    if (!supabase) return res.json({ missions: [] })

    const isAgent = req.user.role === 'agent'
    const field = isAgent ? 'agent_id' : 'client_id'

    const { data, error } = await supabase
      .from('missions')
      .select(`*, agents(users(name, photo_url))`)
      .eq(field, req.user.id)
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    res.json({ missions: data || [] })
  } catch (e) { next(e) }
})

/**
 * PUT /api/missions/:id/accept — Agent accepte la mission
 */
router.put('/:id/accept', authenticate, requireAgent, async (req, res, next) => {
  try {
    if (!supabase) return res.json({ success: true, statut: 'accepted' })

    const { error } = await supabase
      .from('missions')
      .update({ statut: 'accepted' })
      .eq('id', req.params.id)
      .eq('agent_id', req.user.id)

    if (error) throw new Error(error.message)
    res.json({ success: true, statut: 'accepted' })
  } catch (e) { next(e) }
})

/**
 * PUT /api/missions/:id/start — Démarrer la mission
 */
router.put('/:id/start', authenticate, requireAgent, async (req, res, next) => {
  try {
    if (!supabase) return res.json({ success: true, statut: 'active' })

    const { error } = await supabase
      .from('missions')
      .update({ statut: 'active', started_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .eq('agent_id', req.user.id)

    if (error) throw new Error(error.message)
    res.json({ success: true, statut: 'active' })
  } catch (e) { next(e) }
})

/**
 * PUT /api/missions/:id/complete — Terminer (client valide)
 */
router.put('/:id/complete', authenticate, async (req, res, next) => {
  try {
    if (!supabase) return res.json({ success: true, statut: 'completed' })

    const { error } = await supabase
      .from('missions')
      .update({ statut: 'completed', completed_at: new Date().toISOString() })
      .eq('id', req.params.id)

    if (error) throw new Error(error.message)

    // Déclencher libération escrow (asynchrone)
    // releaseEscrow(req.params.id) — à implémenter

    res.json({ success: true, statut: 'completed' })
  } catch (e) { next(e) }
})

/**
 * POST /api/missions/:id/messages — Envoyer un message
 */
router.post('/:id/messages', authenticate, async (req, res, next) => {
  try {
    const { content } = req.body
    if (!content?.trim()) return res.status(400).json({ error: 'Message vide' })

    if (!supabase) {
      return res.json({
        success: true,
        message: { id: Date.now(), content, created_at: new Date().toISOString() },
      })
    }

    const { data, error } = await supabase.from('messages').insert({
      mission_id: req.params.id,
      from_user_id: req.user.id,
      content,
      read: false,
    }).select().single()

    if (error) throw new Error(error.message)
    res.json({ success: true, message: data })
  } catch (e) { next(e) }
})

/**
 * POST /api/missions/:id/rate — Noter après mission
 */
router.post('/:id/rate', authenticate, async (req, res, next) => {
  try {
    const { score, comment, to_user_id } = req.body
    if (!score || score < 1 || score > 5) return res.status(400).json({ error: 'Note entre 1 et 5' })

    if (!supabase) return res.json({ success: true })

    await supabase.from('ratings').insert({
      mission_id: req.params.id,
      from_user_id: req.user.id,
      to_user_id,
      score,
      comment,
    })

    res.json({ success: true })
  } catch (e) { next(e) }
})

module.exports = router
