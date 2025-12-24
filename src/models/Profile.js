import mongoose from 'mongoose'

const profileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, required: true },
    fullName: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    linkedInUrl: { type: String, trim: true },
    courseBranchGradYear: { type: String, trim: true },
    skills: { type: [String], default: [] },
    mobile: { type: String, trim: true },
    avatarUrl: { type: String, trim: true },
    resumePath: { type: String, trim: true },
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Internship' }]
  },
  { timestamps: true }
)

profileSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString()
    delete ret._id
    delete ret.__v
    return ret
  }
})

export default mongoose.model('Profile', profileSchema)
