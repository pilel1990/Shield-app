require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')

const authRouter = require('./routes/auth')
const agentsRouter = require('./routes/agents')
const missionsRouter = require('./routes/missions')
const matchingRouter = require('./routes/matching')
const paymentsRouter = require('./routes/payments')
const uploadsRouter = require('./routes/uploads')
const notificationsRouter = require('./routes/notifications')

const app = express()
const PORT = process.env.PORT || 4000

// ── Middlewares de sécurité ───────────────────────────────────────────────────
app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Rate limiting global
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Trop de requêtes. Réessayez dans 15 minutes.' },
}))

// Rate limiting strict pour auth
app.use('/api/auth', rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  message: { error: 'Trop de tentatives d\'authentification.' },
}))

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRouter)
app.use('/api/agents', agentsRouter)
app.use('/api/missions', missionsRouter)
app.use('/api/matching', matchingRouter)
app.use('/api/payments', paymentsRouter)
app.use('/api/upload', uploadsRouter)
app.use('/api/notify', notificationsRouter)

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'ShieldApp API',
    version: '1.0.0',
    env: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  })
})

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route non trouvée' })
})

// Error handler global
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.message)
  res.status(err.status || 500).json({
    error: err.message || 'Erreur interne du serveur',
  })
})

app.listen(PORT, () => {
  console.log(`🛡️  ShieldApp API démarrée sur le port ${PORT}`)
  console.log(`   Env: ${process.env.NODE_ENV || 'development'}`)
})

module.exports = app
