const express = require('express')
const { v4: uuidv4 } = require('uuid')
const { authenticate } = require('../middleware/auth')
const supabase = require('../services/supabase')

const router = express.Router()

/**
 * POST /api/payments/initiate
 * Initie un paiement Orange Money ou MTN MoMo
 */
router.post('/initiate', authenticate, async (req, res, next) => {
  try {
    const { mission_id, amount_gnf, method, phone } = req.body

    if (!mission_id || !amount_gnf || !method || !phone) {
      return res.status(400).json({ error: 'Champs obligatoires manquants' })
    }
    if (!['orange', 'mtn'].includes(method)) {
      return res.status(400).json({ error: 'Méthode de paiement invalide (orange | mtn)' })
    }
    if (amount_gnf < 1000) {
      return res.status(400).json({ error: 'Montant minimum: 1000 GNF' })
    }

    const reference = `SHD-${Date.now()}-${uuidv4().slice(0, 8).toUpperCase()}`

    // Enregistrer le paiement en statut escrow
    if (supabase) {
      const { error } = await supabase.from('payments').insert({
        mission_id,
        amount_gnf,
        method,
        phone,
        status: 'pending',
        reference,
      })
      if (error) throw new Error(error.message)
    }

    // Appel API Orange Money Guinée
    if (method === 'orange' && process.env.ORANGE_MONEY_API_KEY) {
      // TODO: Intégrer l'API Orange Money Guinée
      // const orangeRes = await callOrangeMoneyAPI({ phone, amount: amount_gnf, reference })
      console.log(`[Orange Money] Initiation paiement ${reference} — ${amount_gnf} GNF → ${phone}`)
    }

    // Appel API MTN MoMo
    if (method === 'mtn' && process.env.MTN_MOMO_API_KEY) {
      // TODO: Intégrer l'API MTN MoMo Guinée
      // const mtnRes = await callMTNMoMoAPI({ phone, amount: amount_gnf, reference })
      console.log(`[MTN MoMo] Initiation paiement ${reference} — ${amount_gnf} GNF → ${phone}`)
    }

    res.json({
      success: true,
      reference,
      message: `Paiement ${method === 'orange' ? 'Orange Money' : 'MTN MoMo'} initié. Confirmez sur votre téléphone.`,
      status: 'pending',
    })
  } catch (e) {
    next(e)
  }
})

/**
 * POST /api/payments/callback
 * Webhook de confirmation de paiement (Orange/MTN)
 */
router.post('/callback', async (req, res, next) => {
  try {
    const { reference, status, transaction_id } = req.body
    console.log(`[Payment Callback] ref=${reference} status=${status} txn=${transaction_id}`)

    if (!supabase) return res.json({ received: true })

    if (status === 'SUCCESS' || status === 'SUCCESSFUL') {
      await supabase
        .from('payments')
        .update({ status: 'escrow', reference: transaction_id || reference })
        .eq('reference', reference)

      // Mettre à jour statut mission
      const { data: payment } = await supabase
        .from('payments')
        .select('mission_id')
        .eq('reference', reference)
        .single()

      if (payment?.mission_id) {
        await supabase
          .from('missions')
          .update({ statut: 'accepted' })
          .eq('id', payment.mission_id)
      }
    }

    res.json({ received: true })
  } catch (e) {
    next(e)
  }
})

/**
 * POST /api/payments/release
 * Libère les fonds escrow vers l'agent après validation mission
 */
router.post('/release', authenticate, async (req, res, next) => {
  try {
    const { mission_id } = req.body

    if (!supabase) return res.json({ success: true, message: 'Paiement libéré (mode dev)' })

    const { data: payment } = await supabase
      .from('payments')
      .select('*')
      .eq('mission_id', mission_id)
      .eq('status', 'escrow')
      .single()

    if (!payment) return res.status(404).json({ error: 'Paiement escrow non trouvé' })

    // TODO: Virer les fonds vers l'agent via API Mobile Money
    // La part agent = 75% du montant hors frais service

    await supabase
      .from('payments')
      .update({ status: 'released', released_at: new Date().toISOString() })
      .eq('id', payment.id)

    console.log(`[Escrow Release] mission=${mission_id} amount=${payment.amount_gnf}`)
    res.json({ success: true, message: 'Fonds libérés vers l\'agent' })
  } catch (e) {
    next(e)
  }
})

module.exports = router
