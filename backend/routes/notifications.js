const express = require('express')
const { authenticate } = require('../middleware/auth')

const router = express.Router()

/**
 * POST /api/notify/sms
 * Envoie un SMS via Africa's Talking
 */
router.post('/sms', authenticate, async (req, res, next) => {
  try {
    const { to, message } = req.body
    if (!to || !message) return res.status(400).json({ error: 'Destinataire et message requis' })

    if (process.env.AFRICASTALKING_API_KEY) {
      const AfricasTalking = require('africastalking')
      const at = AfricasTalking({
        apiKey: process.env.AFRICASTALKING_API_KEY,
        username: process.env.AFRICASTALKING_USERNAME || 'sandbox',
      })
      const result = await at.SMS.send({ to: Array.isArray(to) ? to : [to], message, from: 'ShieldApp' })
      return res.json({ success: true, result })
    }

    console.log(`[SMS Mock] → ${to}: ${message}`)
    res.json({ success: true, mock: true })
  } catch (e) {
    next(e)
  }
})

/**
 * POST /api/notify/push
 * Envoie une notification push (placeholder)
 */
router.post('/push', authenticate, async (req, res, next) => {
  try {
    const { user_id, title, body, data } = req.body
    console.log(`[Push] user=${user_id} title="${title}" body="${body}"`)
    res.json({ success: true })
  } catch (e) {
    next(e)
  }
})

module.exports = router
