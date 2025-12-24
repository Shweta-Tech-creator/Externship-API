import mongoose from 'mongoose'
import validator from 'validator'

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: [validator.isEmail, 'Invalid email']
    },
    passwordHash: { type: String, required: false },
    provider: { type: String, trim: true },
    githubId: { type: String, trim: true },
    googleId: { type: String, trim: true },
    profilePic: { type: String, trim: true }
  },
  { timestamps: true }
)

userSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString()
    delete ret._id
    delete ret.__v
    delete ret.passwordHash
    return ret
  }
})

export default mongoose.model('User', userSchema)
