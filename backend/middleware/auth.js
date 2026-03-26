const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET || 'shieldapp-dev-secret'

/**
 * Middleware d'authentification JWT
 */
function authenticate(req, res, next) {
  const authHeader = req.headers['authorization']
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token d\'authentification manquant' })
  }

  const token = authHeader.split(' ')[1]
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    req.user = payload
    next()
  } catch (e) {
    return res.status(401).json({ error: 'Token invalide ou expiré' })
  }
}

/**
 * Middleware rôle agent uniquement
 */
function requireAgent(req, res, next) {
  if (req.user?.role !== 'agent') {
    return res.status(403).json({ error: 'Accès réservé aux agents' })
  }
  next()
}

/**
 * Middleware rôle client uniquement
 */
function requireClient(req, res, next) {
  if (req.user?.role !== 'client') {
    return res.status(403).json({ error: 'Accès réservé aux clients' })
  }
  next()
}

/**
 * Génère un JWT signé
 */
function signToken(payload, expiresIn = process.env.JWT_EXPIRES_IN || '30d') {
  return jwt.sign(payload, JWT_SECRET, { expiresIn })
}

module.exports = { authenticate, requireAgent, requireClient, signToken }
