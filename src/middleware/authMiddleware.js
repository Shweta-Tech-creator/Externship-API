import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import asyncHandler from "express-async-handler";

const protect = asyncHandler(async (req, res, next) => {
  let token = req.headers.authorization?.startsWith("Bearer")
    ? req.headers.authorization.split(" ")[1]
    : null;

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch admin
    const admin = await Admin.findById(decoded.id).select("-password");

    if (!admin) {
      return res.status(401).json({ message: "Not authorized, admin not found" });
    }

    // Attach to req
    req.admin = admin;
    req.user = { id: admin._id, ...admin.toObject() };

    next();
  } catch (error) {
    console.error("JWT VERIFY ERROR:", error);
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
});

export default protect;
