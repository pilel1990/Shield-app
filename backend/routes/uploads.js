const express = require('express')
const multer = require('multer')
const { authenticate } = require('../middleware/auth')
const supabase = require('../services/supabase')

const router = express.Router()

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
    if (allowed.includes(file.mimetype)) cb(null, true)
    else cb(new Error('Format non supporté. Utilisez JPEG, PNG, WebP ou PDF'))
  },
})

/**
 * POST /api/upload/photo
 * Upload photo de profil agent → Supabase Storage
 */
router.post('/photo', authenticate, upload.single('photo'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Aucun fichier reçu' })

    if (!supabase) {
      return res.json({ success: true, url: '/demo-photo.jpg', mock: true })
    }

    const path = `agents/${req.user.id}/photo-${Date.now()}.jpg`
    const { error } = await supabase.storage
      .from('avatars')
      .upload(path, req.file.buffer, { contentType: req.file.mimetype, upsert: true })

    if (error) throw new Error(error.message)

    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)

    // Mettre à jour le profil
    await supabase.from('users').update({ photo_url: publicUrl }).eq('id', req.user.id)

    res.json({ success: true, url: publicUrl })
  } catch (e) {
    next(e)
  }
})

/**
 * POST /api/upload/document
 * Upload document CNI / attestation
 */
router.post('/document', authenticate, upload.single('document'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Aucun fichier reçu' })
    const { type } = req.body // 'cni' | 'attestation' | 'casier'

    if (!supabase) {
      return res.json({ success: true, url: '/demo-doc.pdf', mock: true })
    }

    const ext = req.file.mimetype === 'application/pdf' ? 'pdf' : 'jpg'
    const path = `agents/${req.user.id}/docs/${type || 'document'}-${Date.now()}.${ext}`

    const { error } = await supabase.storage
      .from('documents')
      .upload(path, req.file.buffer, { contentType: req.file.mimetype })

    if (error) throw new Error(error.message)

    const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(path)
    res.json({ success: true, url: publicUrl })
  } catch (e) {
    next(e)
  }
})

module.exports = router
