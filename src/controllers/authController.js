import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export function signToken(user) {
  const payload = { sub: user.id, email: user.email, name: user.name }
  const secret = process.env.JWT_SECRET
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d'
  return jwt.sign(payload, secret, { expiresIn })
}

export async function register(req, res) {
  try {
    const { name, email, password } = req.body || {}
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : ''
    const trimmedName = typeof name === 'string' ? name.trim() : ''
    if (!trimmedName || !normalizedEmail || !password) {
      return res.status(400).json({ message: 'name, email, password are required' })
    }

    const exists = await User.findOne({ email: normalizedEmail })
    if (exists) return res.status(409).json({ message: 'Email already registered' })

    const passwordHash = await bcrypt.hash(password, 10)
    const user = await User.create({ name: trimmedName, email: normalizedEmail, passwordHash })
    const token = signToken(user)
    return res.status(201).json({ user: user.toJSON(), token })
  } catch (err) {
    console.error('Register error:', err)
    return res.status(500).json({ message: 'Server error' })
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body || {}
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : ''
    if (!normalizedEmail || !password) {
      return res.status(400).json({ message: 'email and password are required' })
    }

    const user = await User.findOne({ email: normalizedEmail })
    if (!user || !user.passwordHash) return res.status(401).json({ message: 'Invalid credentials' })

    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' })

    const token = signToken(user)
    return res.json({ user: user.toJSON(), token })
  } catch (err) {
    console.error('Login error:', err)
    return res.status(500).json({ message: 'Server error' })
  }
}

export async function me(req, res) {
  const user = await User.findById(req.user.sub)
  if (!user) return res.status(404).json({ message: 'User not found' })
  return res.json({ user: user.toJSON() })
}

export async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body || {}
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'currentPassword and newPassword are required' })
    }

    const user = await User.findById(req.user.sub)
    if (!user || !user.passwordHash) {
      return res.status(400).json({ message: 'Password change not available for this account' })
    }

    const ok = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!ok) {
      return res.status(401).json({ message: 'Current password is incorrect' })
    }

    const nextHash = await bcrypt.hash(newPassword, 10)
    user.passwordHash = nextHash
    await user.save()

    return res.json({ message: 'Password updated' })
  } catch (err) {
    console.error('Change password error:', err)
    return res.status(500).json({ message: 'Server error' })
  }
}

export async function oauthCallback(req, res) {
  try {
    if (!req.user) {
      return res.redirect(`${process.env.OAUTH_REDIRECT_ORIGIN}?error=auth_failed`)
    }
    const token = signToken(req.user)
    const redirectUrl = process.env.OAUTH_REDIRECT_ORIGIN.replace(/\/$/, '')
    // Redirect to frontend with token in query params
    return res.redirect(`${redirectUrl}?token=${token}`)
  } catch (err) {
    console.error('OAuth callback error:', err)
    return res.redirect(`${process.env.OAUTH_REDIRECT_ORIGIN}?error=server_error`)
  }
}
