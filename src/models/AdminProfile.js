import mongoose from "mongoose";

const profileSchema = new mongoose.Schema(
  {
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true, index: true, unique: true },
    mydbUserId: { type: mongoose.Schema.Types.ObjectId, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    profilePic: { type: String },
    lastLogin: { type: Date },
  },
  {
    timestamps: true,
    collection: "profile",
  }
);

const AdminProfile = mongoose.model("AdminProfile", profileSchema);

export default AdminProfile;