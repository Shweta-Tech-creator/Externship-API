import 'dotenv/config'
import passport from 'passport'
import { Strategy as GitHubStrategy } from 'passport-github2'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import User from '../models/User.js'

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const BASE_URL = process.env.SERVER_BASE_URL || 'http://localhost:5001'

export function configurePassport() {
  // GitHub OAuth
  if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
    console.warn('GitHub OAuth not configured: missing GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET')
  } else {
    passport.use(new GitHubStrategy({
      clientID: GITHUB_CLIENT_ID,
      clientSecret: GITHUB_CLIENT_SECRET,
      callbackURL: `${BASE_URL}/api/auth/oauth/github/callback`,
      scope: ['user:email']
    }, async function(accessToken, refreshToken, profile, done) {
      try {
        const githubId = profile.id
        const name = profile.displayName || profile.username || 'GitHub User'
        let email = undefined
        if (profile.emails && profile.emails.length) {
          email = profile.emails.find(e => e.verified)?.value || profile.emails[0].value
        }

        // First, try to find user by githubId (primary lookup)
        let user = await User.findOne({ githubId })
        
        // If not found by githubId, only check by email if it doesn't already belong to another OAuth provider
        if (!user && email) {
          const existingUser = await User.findOne({ email })
          if (existingUser && !existingUser.githubId && !existingUser.googleId) {
            // Email exists but no OAuth provider - link it
            existingUser.githubId = githubId
            existingUser.provider = 'github'
            user = await existingUser.save()
          }
        }
        
        // Create new user if still not found
        if (!user) {
          user = await User.create({
            name,
            email: email || `${profile.username}@users.noreply.github.com`,
            provider: 'github',
            githubId
          })
        }
        return done(null, user)
      } catch (err) {
        return done(err)
      }
    }))
  }

  // Google OAuth
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    console.warn('Google OAuth not configured: missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET')
  } else {
    passport.use(new GoogleStrategy({
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: `${BASE_URL}/api/auth/oauth/google/callback`,
      scope: ['email', 'profile']
    }, async function(accessToken, refreshToken, profile, done) {
      try {
        const googleId = profile.id
        const name = profile.displayName || 'Google User'
        const email = profile.emails?.[0]?.value
        const profilePic = profile.photos?.[0]?.value

        // First, try to find user by googleId (primary lookup)
        let user = await User.findOne({ googleId })
        
        // If not found by googleId, only check by email if it doesn't already belong to another OAuth provider
        if (!user && email) {
          const existingUser = await User.findOne({ email })
          if (existingUser && !existingUser.githubId && !existingUser.googleId) {
            // Email exists but no OAuth provider - link it
            existingUser.googleId = googleId
            existingUser.provider = 'google'
            existingUser.profilePic = profilePic
            user = await existingUser.save()
          }
        }
        
        // Create new user if still not found
        if (!user) {
          user = await User.create({
            name,
            email,
            provider: 'google',
            googleId,
            profilePic
          })
        }
        return done(null, user)
      } catch (err) {
        return done(err)
      }
    }))
  }

  return passport
}

export default passport
