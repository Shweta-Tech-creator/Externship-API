import asyncHandler from "express-async-handler";
import Admin from "../models/Admin.js";
import User from "../models/User.js";
import Profile from "../models/Profile.js";
import Project from "../models/Project.js";
import Application from "../models/Application.js";
import Certificate from "../models/Certificate.js";
import jwt from "jsonwebtoken";
import AdminProfile from "../models/AdminProfile.js";
import MyDbUser from "../models/MyDbUser.js";
import getMyDbConnection from "../config/mydb.js";

const generateToken = (id) => {
  // eslint-disable-next-line no-undef
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

export const registerAdmin = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const normEmail = (email || "").trim().toLowerCase();

  console.log("REGISTER attempt", { email: normEmail });
  const adminExists = await Admin.findOne({ email: normEmail });
  console.log("REGISTER adminExists", Boolean(adminExists));
  if (adminExists) {
    res.status(400);
    throw new Error("Admin already exists");
  }

  const admin = await Admin.create({
    name,
    email: normEmail,
    password,
  });

  if (admin) {
    console.log("REGISTER success", { id: admin._id.toString() });
    res.status(201).json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      token: generateToken(admin._id),
    });
  } else {
    res.status(400);
    throw new Error("Invalid admin data");
  }
});

export const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const normEmail = (email || "").trim().toLowerCase();

  console.log("LOGIN attempt", { email: normEmail });
  const admin = await Admin.findOne({ email: normEmail });
  console.log("LOGIN adminFound", Boolean(admin));

  const passwordOk = admin ? await admin.matchPassword(password) : false;
  console.log("LOGIN passwordOk", passwordOk);
  if (admin && passwordOk) {
    let legacyUserId = null;
    try {
      if (process.env.MYDB_URL) {
        const legacyUser = await MyDbUser.findOne({ email: normEmail }).select("_id");
        legacyUserId = legacyUser ? legacyUser._id : null;
      }
    } catch (e) {
      console.warn("LOGIN legacy mydb lookup failed", e?.message);
    }

    await AdminProfile.updateOne(
      { adminId: admin._id },
      {
        $set: {
          name: admin.name,
          email: admin.email,
          lastLogin: new Date(),
          ...(legacyUserId ? { mydbUserId: legacyUserId } : {}),
        },
        $setOnInsert: {
          adminId: admin._id,
        },
      },
      { upsert: true }
    );

    res.json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      token: generateToken(admin._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});

export const getLinkedMydbUser = asyncHandler(async (req, res) => {
  if (!req.admin) {
    return res.status(401).json({ message: "Not authorized" });
  }

  const profile = await AdminProfile.findOne({ adminId: req.admin._id }).select("mydbUserId");

  if (!profile || !profile.mydbUserId) {
    return res.status(404).json({ message: "Linked mydb user not found" });
  }

  return res.json({ mydbUserId: profile.mydbUserId });
});

export const getAdminProfile = asyncHandler(async (req, res) => {
  if (!req.admin) {
    return res.status(404).json({ message: "Admin not found" });
  }

  res.json({
    _id: req.admin._id,
    name: req.admin.name,
    email: req.admin.email,
    profilePic: req.admin.profilePic || null,
  });
});

export const getLatestMydbUser = asyncHandler(async (req, res) => {
  if (!req.admin) {
    return res.status(401).json({ message: "Not authorized" });
  }

  if (!MyDbUser) {
    return res.status(500).json({ message: "MyDb connection not configured" });
  }

  const latestUser = await MyDbUser.findOne({}).sort({ _id: -1 });

  if (!latestUser) {
    return res.status(404).json({ message: "No users found in mydb" });
  }

  return res.json({
    _id: latestUser._id,
    name: latestUser.name,
    email: latestUser.email,
  });
});

// Get total count of users from mydb database
export const getTotalUsers = asyncHandler(async (req, res) => {
  if (!req.admin) {
    return res.status(401).json({ message: "Not authorized" });
  }

  try {
    if (!MyDbUser) {
      return res.status(500).json({ message: "MyDb connection not configured" });
    }

    const totalUsers = await MyDbUser.countDocuments({});

    res.json({ totalUsers });
  } catch (error) {
    console.error("Error fetching total users:", error);
    res.status(500).json({ message: "Failed to fetch total users" });
  }
});

// Get all users with details
export const getAllUsers = asyncHandler(async (req, res) => {
  if (!req.admin) {
    return res.status(401).json({ message: "Not authorized" });
  }

  try {
    if (!MyDbUser) {
      return res.status(500).json({ message: "MyDb connection not configured" });
    }

    const users = await MyDbUser.find({})
      .select("name email")
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    console.error("Error fetching all users:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

// Get detailed user profile
export const getUserProfile = asyncHandler(async (req, res) => {
  if (!req.admin) {
    return res.status(401).json({ message: "Not authorized" });
  }

  try {
    const { userId } = req.params;

    // Get basic user info
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get user profile details
    const profile = await Profile.findOne({ user: userId });

    // Get user projects
    const projects = await Project.find({ user: userId });

    // Get user certificates
    const certificates = await Certificate.find({ user: userId }).select('originalName filePath mimeType size createdAt');

    // Format certificates with URL
    const formattedCertificates = certificates.map(cert => ({
      id: cert._id,
      originalName: cert.originalName,
      name: cert.originalName,
      url: cert.filePath, // This should be the accessible URL
      size: cert.size,
      mimeType: cert.mimeType,
      uploadedAt: cert.createdAt
    }));

    // Get user applications (internship status)
    const applications = await Application.find({ studentId: userId })
      .populate('internship', 'title company')
      .sort({ createdAt: -1 });

    // Determine internship status based on applications
    let internshipStatus = 'Not Applied';
    if (applications.length > 0) {
      const latestApp = applications[0];
      internshipStatus = latestApp.status || 'Pending';
    }

    // Combine all data
    const userProfile = {
      ...user.toJSON(),
      name: profile?.fullName || user.name,
      email: profile?.email || user.email,
      linkedInUrl: profile?.linkedInUrl || 'N/A',
      course: profile?.courseBranchGradYear || 'N/A',
      skills: profile?.skills || [],
      mobile: profile?.mobile || 'N/A',
      projects: projects || [],
      certificates: formattedCertificates,
      internshipStatus: internshipStatus,
      applications: applications.map(app => ({
        id: app._id,
        internshipTitle: app.internship?.title || 'N/A',
        company: app.internship?.company || 'N/A',
        status: app.status,
        githubUrl: app.githubUrl,
        liveUrl: app.liveUrl,
        feedback: app.feedback,
        appliedAt: app.createdAt
      }))
    };

    res.json(userProfile);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Failed to fetch user profile" });
  }
});
