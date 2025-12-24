import MyDbUser from "../models/MyDbUser.js";
import User from "../models/User.js";

// Get all users/interns from mydb
export const getUsers = async (req, res) => {
  try {
    const users = await MyDbUser.find().select("name email");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get recent logins - sort by last login date
export const getRecentLogins = async (req, res) => {
  try {
    // Get users sorted by last login date (most recent first)
    const users = await MyDbUser.find()
      .select("name email lastLogin updatedAt")
      .sort({ lastLogin: -1, updatedAt: -1 })
      .limit(20);
      
    res.json(users);
  } catch (err) {
    console.error('getRecentLogins error', err);
    res.status(500).json({ message: 'Failed to fetch recent logins' });
  }
};

// Get single user by ID
export const getUserById = async (req, res) => {
  try {
    const user = await MyDbUser.findById(req.params.id).select("name email");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Public count endpoint (no auth) — returns number of registered users
export const getUsersCountPublic = async (req, res) => {
  try {
    // Prefer MyDbUser if configured, otherwise fall back to default User collection
    if (MyDbUser && MyDbUser.countDocuments) {
      try {
        const count = await MyDbUser.countDocuments({});
        return res.json({ count });
      } catch (e) {
        // if mydb fails, try default
        console.warn('MyDbUser count failed, falling back to default User:', e?.message);
      }
    }

    const fallbackCount = await User.countDocuments({});
    return res.json({ count: fallbackCount });
  } catch (err) {
    console.error('getUsersCountPublic error', err);
    res.status(500).json({ message: 'Failed to fetch users count' });
  }
};
