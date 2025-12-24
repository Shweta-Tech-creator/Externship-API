import mongoose from 'mongoose'
import validator from 'validator'

const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      validate: [validator.isEmail, 'Invalid email']
    },
    message: { type: String, required: true, trim: true, maxlength: 5000 }
  },
  { timestamps: true }
)

export default mongoose.model('ContactMessage', contactSchema)
