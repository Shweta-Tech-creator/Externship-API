import Notification from "../models/Notification.js";

// Get all notifications
export const getNotifications = async (req, res) => {
  try {
    const adminId = req.admin?._id;
    if (!adminId) return res.status(401).json({ message: "Unauthorized" });

    const now = new Date();

    const notifications = await Notification.find({
      adminId,
      archived: { $ne: true },
      $or: [
        { snoozedUntil: null },
        { snoozedUntil: { $lte: now } }
      ]
    })
      .populate("internId", "name email")
      .populate("applicationId", "candidateName position status")
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(notifications);
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
};

// Unread count
export const getUnreadCount = async (req, res) => {
  try {
    const adminId = req.admin?._id;
    if (!adminId) return res.status(401).json({ message: "Unauthorized" });

    const count = await Notification.countDocuments({
      adminId,
      isRead: false,
    });

    res.json({ count });
  } catch (error) {
    console.error("Get unread count error:", error);
    res.status(500).json({ message: "Failed to get unread count" });
  }
};

// Create notification
export const createNotification = async (req, res) => {
  try {
    const adminId = req.admin?._id;
    if (!adminId) return res.status(401).json({ message: "Unauthorized" });

    const { title, message, type, internId, applicationId, link } = req.body;

    if (!title || !message) {
      return res.status(400).json({ message: "Title and message are required" });
    }

    const notification = await Notification.create({
      title,
      message,
      type: type || "info",
      adminId,
      internId: internId || null,
      applicationId: applicationId || null,
      link: link ?? null,
    });

    res.status(201).json({
      message: "Notification created successfully",
      notification,
    });
  } catch (error) {
    console.error("Create notification error:", error);
    res.status(500).json({ message: "Failed to create notification" });
  }
};

// Mark as read
export const markAsRead = async (req, res) => {
  try {
    const adminId = req.admin?._id;
    const { id } = req.params;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, adminId },
      { isRead: true },
      { new: true }
    );

    if (!notification)
      return res.status(404).json({ message: "Notification not found" });

    res.json({ message: "Notification marked as read", notification });
  } catch (error) {
    console.error("Mark as read error:", error);
    res.status(500).json({ message: "Failed to mark notification as read" });
  }
};

// Mark all as read
export const markAllAsRead = async (req, res) => {
  try {
    const adminId = req.admin?._id;

    const result = await Notification.updateMany(
      { adminId, isRead: false },
      { isRead: true }
    );

    res.json({
      message: "All notifications marked as read",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Mark all as read error:", error);
    res.status(500).json({ message: "Failed to mark all as read" });
  }
};

// Delete notification
export const deleteNotification = async (req, res) => {
  try {
    const adminId = req.admin?._id;
    const { id } = req.params;

    const notification = await Notification.findOneAndDelete({
      _id: id,
      adminId,
    });

    if (!notification)
      return res.status(404).json({ message: "Notification not found" });

    res.json({ message: "Notification deleted successfully" });
  } catch (error) {
    console.error("Delete notification error:", error);
    res.status(500).json({ message: "Failed to delete notification" });
  }
};

// Snooze notification
export const snoozeNotification = async (req, res) => {
  try {
    const adminId = req.admin?._id;
    const { id } = req.params;
    const { minutes = 60 } = req.body;

    const until = new Date(Date.now() + Number(minutes) * 60000);

    const notification = await Notification.findOneAndUpdate(
      { _id: id, adminId },
      { snoozedUntil: until },
      { new: true }
    );

    if (!notification)
      return res.status(404).json({ message: "Notification not found" });

    res.json({ message: "Notification snoozed", notification });
  } catch (error) {
    console.error("Snooze error:", error);
    res.status(500).json({ message: "Failed to snooze notification" });
  }
};

// Unsnooze
export const unsnoozeNotification = async (req, res) => {
  try {
    const adminId = req.admin?._id;
    const { id } = req.params;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, adminId },
      { $unset: { snoozedUntil: 1 } },
      { new: true }
    );

    if (!notification)
      return res.status(404).json({ message: "Notification not found" });

    res.json({ message: "Notification unsnoozed", notification });
  } catch (error) {
    console.error("Unsnooze error:", error);
    res.status(500).json({ message: "Failed to unsnooze notification" });
  }
};

// Archive
export const archiveNotification = async (req, res) => {
  try {
    const adminId = req.admin?._id;
    const { id } = req.params;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, adminId },
      { archived: true },
      { new: true }
    );

    if (!notification)
      return res.status(404).json({ message: "Notification not found" });

    res.json({ message: "Notification archived", notification });
  } catch (error) {
    console.error("Archive error:", error);
    res.status(500).json({ message: "Failed to archive notification" });
  }
};

// Unarchive
export const unarchiveNotification = async (req, res) => {
  try {
    const adminId = req.admin?._id;
    const { id } = req.params;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, adminId },
      { archived: false },
      { new: true }
    );

    if (!notification)
      return res.status(404).json({ message: "Notification not found" });

    res.json({ message: "Notification unarchived", notification });
  } catch (error) {
    console.error("Unarchive error:", error);
    res.status(500).json({ message: "Failed to unarchive notification" });
  }
};
