import mongoose from 'mongoose'
import Admin from '../models/Admin.js'

export default async function connectDB() {
  const uri = process.env.MONGO_URL
  if (!uri) throw new Error('MONGO_URL not set')
  mongoose.set('strictQuery', true)
  await mongoose.connect(uri)
  console.log(`[DEBUG] MongoDB connected to database: ${mongoose.connection.name}`)

  // Seed Admin if it doesn't exist
  try {
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@gmail.com').trim()
    const adminPassword = (process.env.ADMIN_PASSWORD || 'admin123').trim()
    const allAdminsCount = await Admin.countDocuments({})
    console.log(`[DEBUG] Total Admins in database: ${allAdminsCount}`);
    const adminName = 'System Admin'

    console.log(`[DEBUG] DB Seeding checking for email: ${adminEmail.toLowerCase()}`);

    let admin = await Admin.findOne({ email: adminEmail.toLowerCase() })
    console.log(`[DEBUG] DB Seeding search for ${adminEmail}: ${admin ? 'FOUND' : 'NOT FOUND'}`);

    if (!admin) {
      console.log(`[DEBUG] Seeding NEW admin: ${adminEmail}`);
      admin = new Admin({
        name: adminName,
        email: adminEmail.toLowerCase(),
        password: adminPassword
      })
      await admin.save()
      console.log('[DEBUG] Admin seeded successfully');
    } else {
      console.log(`[DEBUG] Synchronizing password for: ${adminEmail}`);
      admin.password = adminPassword
      await admin.save()
      console.log('[DEBUG] Admin credentials synchronized with .env');
    }
  } catch (err) {
    console.error('[CRITICAL] Admin seeding/sync failed:', err);
  }
}
