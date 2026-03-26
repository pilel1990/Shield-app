const express = require('express')
const Anthropic = require('@anthropic-ai/sdk')
const supabase = require('../services/supabase')

const router = express.Router()

/**
 * POST /api/matching
 * Matching IA des agents via Claude claude-sonnet-4-20250514
 */
router.post('/', async (req, res, next) => {
  try {
    const { type, urgence, commune, duree_heures, description } = req.body

    // Récupérer les agents disponibles
    let agents = []
    if (supabase) {
      const { data } = await supabase
        .from('agents')
        .select(`id, badge, experience, armed, bio, competences, rating, missions_count, commune, mission_type`)
        .eq('available', true)
        .eq('status', 'active')
        .order('rating', { ascending: false })
        .limit(20)
      agents = data || []
    }

    if (agents.length === 0) {
      return res.json({ agents: [], ia_used: false, message: 'Aucun agent disponible' })
    }

    // Tenter le matching IA via Claude
    if (process.env.ANTHROPIC_API_KEY) {
      try {
        const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

        const prompt = `Tu es un système de matching pour ShieldApp, une marketplace de sécurité privée à Conakry, Guinée.

Mission à pourvoir:
- Type: ${type}
- Urgence: ${urgence}
- Commune: ${commune || 'Non spécifiée'}
- Durée: ${duree_heures}h
- Description: ${description || 'Non fournie'}

Agents disponibles:
${agents.map((a, i) => `
Agent ${i + 1} (ID: ${a.id}):
- Expérience: ${a.experience} ans
- Armé: ${a.armed ? 'Oui' : 'Non'}
- Types de mission: ${a.mission_type?.join(', ') || 'Non spécifié'}
- Note: ${a.rating}/5
- Missions: ${a.missions_count}
- Commune: ${a.commune}
- Compétences: ${a.competences?.join(', ') || 'Non renseignées'}
- Bio: ${a.bio || 'Non renseignée'}
`).join('')}

Retourne un JSON avec les agents triés par score de 0 à 100, en expliquant brièvement le score.
Format: {"ranked": [{"id": "...", "score": 85, "reason": "..."}]}`

        const response = await client.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1024,
          messages: [{ role: 'user', content: prompt }],
        })

        const text = response.content[0].text
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const { ranked } = JSON.parse(jsonMatch[0])
          const scoredAgents = ranked.map(r => {
            const agent = agents.find(a => a.id === r.id)
            return agent ? { ...agent, score: r.score, ia_reason: r.reason } : null
          }).filter(Boolean)

          return res.json({ agents: scoredAgents, ia_used: true })
        }
      } catch (iaError) {
        console.error('[Matching IA] Erreur Claude:', iaError.message)
        // Fallback vers scoring algorithmique
      }
    }

    // Scoring algorithmique (fallback sans clé IA)
    const scored = agents.map(agent => {
      let score = 0
      // Note (40 pts max)
      score += (agent.rating / 5) * 40
      // Expérience (20 pts max)
      score += Math.min(agent.experience / 15, 1) * 20
      // Nombre de missions (15 pts max)
      score += Math.min(agent.missions_count / 200, 1) * 15
      // Match type de mission (15 pts)
      if (agent.mission_type?.includes(type)) score += 15
      // Armé si mission VIP ou escorte (10 pts)
      if (agent.armed && ['garde_corps_vip', 'escorte_securisee'].includes(type)) score += 10
      // Même commune (bonus)
      if (commune && agent.commune === commune) score += 5

      return { ...agent, score: Math.round(score) }
    })

    scored.sort((a, b) => b.score - a.score)
    res.json({ agents: scored, ia_used: false })
  } catch (e) {
    next(e)
  }
})

module.exports = router
