import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ["info", "success", "warning"], default: "info" },

    adminId: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true },
    internId: { type: mongoose.Schema.Types.ObjectId, ref: "Intern", default: null },
    applicationId: { type: mongoose.Schema.Types.ObjectId, ref: "Application", default: null },

    link: { type: String, default: null },
    isRead: { type: Boolean, default: false },
    snoozedUntil: { type: Date, default: null },
    archived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);