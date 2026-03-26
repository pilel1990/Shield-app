const express = require('express')
const { authenticate, requireAgent } = require('../middleware/auth')
const supabase = require('../services/supabase')

const router = express.Router()

/**
 * GET /api/agents
 * Liste les agents disponibles avec filtres optionnels
 */
router.get('/', async (req, res, next) => {
  try {
    const { type, commune, armed, limit = 20, offset = 0 } = req.query

    if (!supabase) {
      return res.json({ agents: [], total: 0, message: 'Mode dev — Supabase non configuré' })
    }

    let query = supabase
      .from('agents')
      .select(`
        id, badge, mission_type, experience, armed, bio, competences,
        rating, missions_count, available, commune, status,
        users!inner(id, name, phone, photo_url)
      `)
      .eq('available', true)
      .eq('status', 'active')
      .order('rating', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1)

    if (commune) query = query.eq('commune', commune)
    if (armed !== undefined) query = query.eq('armed', armed === 'true')
    if (type) query = query.contains('mission_type', [type])

    const { data, error, count } = await query
    if (error) throw new Error(error.message)

    res.json({ agents: data || [], total: count || 0 })
  } catch (e) {
    next(e)
  }
})

/**
 * GET /api/agents/:id
 * Profil complet d'un agent
 */
router.get('/:id', async (req, res, next) => {
  try {
    if (!supabase) return res.json({ agent: null })

    const { data, error } = await supabase
      .from('agents')
      .select(`*, users!inner(id, name, phone, photo_url, commune)`)
      .eq('id', req.params.id)
      .single()

    if (error || !data) return res.status(404).json({ error: 'Agent non trouvé' })
    res.json({ agent: data })
  } catch (e) {
    next(e)
  }
})

/**
 * PUT /api/agents/:id/availability
 * L'agent toggle sa disponibilité
 */
router.put('/:id/availability', authenticate, requireAgent, async (req, res, next) => {
  try {
    const { available } = req.body
    if (typeof available !== 'boolean') {
      return res.status(400).json({ error: 'Le champ available doit être un booléen' })
    }

    if (!supabase) return res.json({ success: true, available })

    const { error } = await supabase
      .from('agents')
      .update({ available })
      .eq('user_id', req.user.id)

    if (error) throw new Error(error.message)
    res.json({ success: true, available })
  } catch (e) {
    next(e)
  }
})

/**
 * POST /api/agents/register
 * Inscription d'un nouvel agent
 */
router.post('/register', authenticate, async (req, res, next) => {
  try {
    const { badge, experience, armed, bio, competences, mission_types, commune } = req.body

    if (!badge) return res.status(400).json({ error: 'Numéro de badge requis' })

    if (!supabase) {
      return res.json({ success: true, agent: { id: 'dev-agent', badge, status: 'pending' } })
    }

    // Mettre à jour le rôle de l'utilisateur
    await supabase.from('users').update({ role: 'agent' }).eq('id', req.user.id)

    const { data, error } = await supabase.from('agents').insert({
      user_id: req.user.id,
      badge,
      experience: experience || 1,
      armed: armed || false,
      bio,
      competences: competences || [],
      mission_type: mission_types || [],
      commune: commune || 'Kaloum',
      status: 'pending',
      available: false,
      rating: 0,
      missions_count: 0,
    }).select().single()

    if (error) throw new Error(error.message)
    res.json({ success: true, agent: data })
  } catch (e) {
    next(e)
  }
})

module.exports = router
