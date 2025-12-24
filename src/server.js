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
