import mongoose from "mongoose";

const applicationSchema = mongoose.Schema(
  {
    internship: { type: mongoose.Schema.Types.ObjectId, ref: "Internship", required: true },
    studentId: { type: String, required: true },
    studentName: { type: String },
    studentEmail: { type: String },
    githubUrl: { type: String, required: true },
    liveUrl: { type: String, required: true },
    feedback: { type: String },
    status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
  },
  {
    timestamps: true,
  }
);

const Application = mongoose.model("Application", applicationSchema);
export default Application;