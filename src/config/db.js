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

    console.log(`[DEBUG] DB Seeding checking for email: ${adminEmail.toLowerCase()}`);

    let admin = await Admin.findOne({ email: adminEmail.toLowerCase() })
    if (!admin) {
      console.log('Seeding default admin...')
      admin = new Admin({
        name: adminName,
        email: adminEmail.toLowerCase(),
        password: adminPassword
      })
      await admin.save()
      console.log('Admin seeded successfully')
    } else {
      // Ensure password matches the fixed .env credential
      admin.password = adminPassword
      await admin.save()
      console.log('Admin credentials synchronized with .env')
    }
  } catch (err) {
    console.error('Admin seeding failed:', err.message)
  }
}
