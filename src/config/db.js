import mongoose from 'mongoose'
import Admin from '../models/Admin.js'

export default async function connectDB() {
  const uri = process.env.MONGO_URL
  if (!uri) throw new Error('MONGO_URL not set')
  mongoose.set('strictQuery', true)
  await mongoose.connect(uri)
  console.log('MongoDB connected')

  // Seed Admin if it doesn't exist
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@gmail.com'
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'
    const adminName = 'System Admin'

    const adminExists = await Admin.findOne({ email: adminEmail.toLowerCase() })
    if (!adminExists) {
      console.log('Seeding default admin...')
      await Admin.create({
        name: adminName,
        email: adminEmail.toLowerCase(),
        password: adminPassword
      })
      console.log('Admin seeded successfully')
    }
  } catch (err) {
    console.error('Admin seeding failed:', err.message)
  }
}
