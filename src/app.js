import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import authRoutes from './routes/authRoutes.js'
import contactRoutes from './routes/contactRoutes.js'
import errorHandler from './middleware/errorHandler.js'
import profileRoutes from './routes/profileRoutes.js'
import uploadRoutes from './routes/uploadRoutes.js'
// Temporarily disabled imports due to missing controllers
import adminRoutes from './routes/adminRoutes.js'
import notificationRoutes from './routes/notificationRoutes.js'
import userRoutes from './routes/userRoutes.js'
import studentRoutes from './routes/studentRoutes.js'
import internshipRoutes from './routes/internshipRoutes.js'
import applicationRoutes from './routes/applicationRoutes.js'
import attendanceRoutes from './routes/attendanceRoutes.js'

import path from 'path'
import passport from 'passport'
import { configurePassport } from './auth/passport.js'
import { swaggerDocs } from "./swagger.js";

const app = express()
const PORT = process.env.PORT || 3001

// CORS: allow any origin in dev; restrict via env in prod if needed
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174", "https://externship-webapp.onrender.com", process.env.CORS_ORIGIN],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Authorization']
}))

app.use(express.json())
app.use(morgan('dev'))

// Serve uploaded files statically (e.g., avatars, resumes)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')))

// Passport initialization
configurePassport()
app.use(passport.initialize())

app.get('/', (req, res) => {
  res.json({ message: 'Backend running', status: 'ok', timestamp: new Date().toISOString() })
})
app.get('/health', (req, res) => res.json({ ok: true }))

swaggerDocs(app);

// API Routes
// Note: Mounting at BOTH /api and /api/api to handle legacy/malformed frontend requests (Robust Fix)
app.use('/api/auth', authRoutes)
app.use('/api/api/auth', authRoutes)

app.use('/api/contact', contactRoutes)
app.use('/api/api/contact', contactRoutes)

app.use('/api/profile', profileRoutes)
app.use('/api/api/profile', profileRoutes)

app.use('/api/uploads', uploadRoutes)
app.use('/api/api/uploads', uploadRoutes)

// Robust Routing: handle various prefix combinations
app.use('/api/internship', internshipRoutes)
app.use('/api/api/internship', internshipRoutes)
app.use('/internship', internshipRoutes)

app.use('/api/application', applicationRoutes)
app.use('/api/api/application', applicationRoutes)
app.use('/application', applicationRoutes)

app.use('/api/attendance', attendanceRoutes)
app.use('/api/api/attendance', attendanceRoutes)
app.use('/attendance', attendanceRoutes)

app.use('/api/notifications', notificationRoutes)
app.use('/api/api/notifications', notificationRoutes)
app.use('/notifications', notificationRoutes)

app.use('/api/users', userRoutes)
app.use('/api/api/users', userRoutes)
app.use('/users', userRoutes)

app.use('/api/student', studentRoutes)
app.use('/api/api/student', studentRoutes)
app.use('/student', studentRoutes)

app.use('/api/admin', adminRoutes)
app.use('/api/api/admin', adminRoutes)
app.use('/admin', adminRoutes)

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` })
})

app.use(errorHandler)

export default app
