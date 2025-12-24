import mongoose from "mongoose";

const internshipSchema = mongoose.Schema(
  {
    title: { type: String, required: true },
    duration: { type: String, required: true },
    techStack: { type: [String], required: true },
    role: { type: String, required: true },
    tools: { type: [String], required: true },
    benefits: { type: [String] },
    company: { type: String },
    workMode: { type: String },
    description: { type: String },
    project: { type: String },
    stipend: { type: String },
    location: { type: String },
    internshipType: { type: String },
    deadline: { type: String },
    skillsRequired: { type: [String] },
    experience: { type: Number, default: 0 },
    openings: { type: Number },
    paid: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  },
  {
    timestamps: true,
  }
);

const Internship = mongoose.model("Internship", internshipSchema);
export default Internship;