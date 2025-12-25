import 'dotenv/config'
import http from 'http'
import app from './app.js'
import connectDB from '../config/db.js'

const PORT = process.env.PORT || 5001

async function start() {
  try {
    console.log('Starting server...')
    console.log('PORT:', PORT)
    console.log('NODE_ENV:', process.env.NODE_ENV)

    // Essential Environment Variable Validation
    const requiredEnv = ['MONGO_URL', 'JWT_SECRET']
    const missing = requiredEnv.filter(k => !process.env[k])
    if (missing.length > 0) {
      console.error(`[CRITICAL] Missing essential environment variables: ${missing.join(', ')}`)
      console.error('Please ensure these are set in your Render dashboard or .env file.')
      // In production, we might want to exit, but for now we'll just log loudly
    }

    await connectDB()
    console.log('Database connected')

    const server = http.createServer(app)
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`API running on http://0.0.0.0:${PORT}`)
    })
  } catch (err) {
    console.error('Failed to start server:', err)
    process.exit(1)
  }
}

start()
