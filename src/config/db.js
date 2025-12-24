import mongoose from 'mongoose'

export default async function connectDB() {
  const uri = process.env.MONGO_URL
  if (!uri) throw new Error('MONGO_URL not set')
  mongoose.set('strictQuery', true)
  await mongoose.connect(uri)
  console.log('MongoDB connected')
}
