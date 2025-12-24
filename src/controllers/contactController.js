import ContactMessage from '../models/ContactMessage.js'

export async function submit(req, res) {
  try {
    const { name, email, message } = req.body || {}
    if (!name || !email || !message) return res.status(400).json({ message: 'name, email, message are required' })
    const doc = await ContactMessage.create({ name, email, message })
    return res.status(201).json({ success: true, id: doc.id })
  } catch (err) {
    console.error('Contact submit error:', err)
    return res.status(500).json({ message: 'Server error' })
  }
}

export async function list(req, res) {
  try {
    const docs = await ContactMessage.find().sort({ createdAt: -1 })
    return res.json({ items: docs.map((d) => d.toJSON()) })
  } catch (err) {
    console.error('Contact list error:', err)
    return res.status(500).json({ message: 'Server error' })
  }
}
