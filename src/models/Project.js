import mongoose from 'mongoose'

const projectSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    githubUrl: { type: String, default: '' },
    demoUrl: { type: String, default: '' },
  },
  { timestamps: true }
)

projectSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString()
    delete ret._id
    delete ret.__v
    return ret
  },
})

export default mongoose.model('Project', projectSchema)
