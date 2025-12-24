import jwt from 'jsonwebtoken'

export function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || ''
    const token = header.startsWith('Bearer ') ? header.slice(7) : null
    if (!token) return res.status(401).json({ message: 'Missing token' })
    const data = jwt.verify(token, process.env.JWT_SECRET)
    // Normalize: ensure both sub and id are available
    req.user = data || {}
    if (req.user && req.user.sub && !req.user.id) req.user.id = req.user.sub
    next()
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' })
  }
}
