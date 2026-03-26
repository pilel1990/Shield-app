const express = require('express')
const bcrypt = require('bcryptjs')
const { v4: uuidv4 } = require('uuid')
const { signToken, authenticate } = require('../middleware/auth')
const supabase = require('../services/supabase')

const router = express.Router()

// Stockage temporaire OTP (en prod: Redis)
const otpStore = new Map()

/**
 * POST /api/auth/send-otp
 * Envoie un code OTP par SMS via Africa's Talking
 */
router.post('/send-otp', async (req, res, next) => {
  try {
    const { phone } = req.body
    if (!phone || !phone.match(/^\+224[67]\d{8}$/)) {
      return res.status(400).json({ error: 'Numéro de téléphone invalide. Format: +224 6XX XXX XXX' })
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString()
    const expiresAt = Date.now() + 5 * 60 * 1000 // 5 min
    otpStore.set(phone, { otp, expiresAt, attempts: 0 })

    // Envoi SMS via Africa's Talking
    if (process.env.AFRICASTALKING_API_KEY) {
      const AfricasTalking = require('africastalking')
      const at = AfricasTalking({
        apiKey: process.env.AFRICASTALKING_API_KEY,
        username: process.env.AFRICASTALKING_USERNAME || 'sandbox',
      })
      await at.SMS.send({
        to: [phone],
        message: `ShieldApp: Votre code de vérification est ${otp}. Valable 5 minutes.`,
        from: 'ShieldApp',
      })
    } else {
      console.log(`[OTP] ${phone}: ${otp}`)
    }

    res.json({ success: true, message: 'Code OTP envoyé par SMS' })
  } catch (e) {
    next(e)
  }
})

/**
 * POST /api/auth/verify-otp
 * Vérifie le code OTP reçu par SMS
 */
router.post('/verify-otp', async (req, res, next) => {
  try {
    const { phone, otp } = req.body
    const record = otpStore.get(phone)

    if (!record) return res.status(400).json({ error: 'Aucun OTP envoyé à ce numéro' })
    if (Date.now() > record.expiresAt) {
      otpStore.delete(phone)
      return res.status(400).json({ error: 'Code OTP expiré. Veuillez en demander un nouveau.' })
    }
    if (record.attempts >= 3) {
      otpStore.delete(phone)
      return res.status(400).json({ error: 'Trop de tentatives. Demandez un nouveau code.' })
    }
    if (record.otp !== otp) {
      record.attempts++
      return res.status(400).json({ error: 'Code incorrect' })
    }

    otpStore.delete(phone)

    // Vérifier si l'utilisateur existe
    let isNew = true
    let user = null
    if (supabase) {
      const { data } = await supabase.from('users').select('*').eq('phone', phone).single()
      if (data) { isNew = false; user = data }
    }

    const otpToken = signToken({ phone, purpose: 'otp_verified' }, '15m')
    res.json({ success: true, isNew, token: otpToken, user })
  } catch (e) {
    next(e)
  }
})

/**
 * POST /api/auth/set-pin
 * Définit le PIN pour un nouvel utilisateur
 */
router.post('/set-pin', authenticate, async (req, res, next) => {
  try {
    const { phone, pin, name, role } = req.body
    if (!pin || pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      return res.status(400).json({ error: 'Le PIN doit contenir exactement 4 chiffres' })
    }

    const pinHash = await bcrypt.hash(pin, 12)
    const userId = uuidv4()

    if (supabase) {
      const { error } = await supabase.from('users').upsert({
        id: userId,
        phone,
        pin_hash: pinHash,
        role: role || 'client',
        name: name || null,
        verified: true,
        created_at: new Date().toISOString(),
      })
      if (error) throw new Error(error.message)
    }

    res.json({ success: true, userId })
  } catch (e) {
    next(e)
  }
})

/**
 * POST /api/auth/login
 * Authentifie un utilisateur existant via téléphone + PIN
 */
router.post('/login', async (req, res, next) => {
  try {
    const { phone, pin } = req.body
    if (!phone || !pin) {
      return res.status(400).json({ error: 'Téléphone et PIN requis' })
    }

    let user = null
    if (supabase) {
      const { data, error } = await supabase.from('users').select('*').eq('phone', phone).single()
      if (error || !data) return res.status(401).json({ error: 'Compte non trouvé' })

      const pinValid = await bcrypt.compare(pin, data.pin_hash)
      if (!pinValid) return res.status(401).json({ error: 'PIN incorrect' })
      user = data
    } else {
      // Mode dev sans Supabase
      user = { id: `dev-${phone}`, phone, role: 'client', name: 'Utilisateur Dev' }
    }

    const token = signToken({ id: user.id, phone: user.phone, role: user.role })
    res.json({ success: true, token, user: { id: user.id, phone: user.phone, role: user.role, name: user.name, commune: user.commune } })
  } catch (e) {
    next(e)
  }
})

module.exports = router
