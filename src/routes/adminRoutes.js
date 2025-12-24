import express from "express";
import { 
  loginAdmin, 
  registerAdmin, 
  getAdminProfile, 
  getLinkedMydbUser, 
  getLatestMydbUser,
  getTotalUsers,
  getAllUsers,
  getUserProfile
} from "../controllers/adminController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin management APIs
 */

/**
 * @swagger
 * /api/admin/register:
 *   post:
 *     summary: Register a new admin
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Admin registered successfully
 */
router.post("/register", registerAdmin);

/**
 * @swagger
 * /api/admin/login:
 *   post:
 *     summary: Login admin
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Admin logged in successfully
 */
router.post("/login", loginAdmin);

/**
 * @swagger
 * /api/admin/profile:
 *   get:
 *     summary: Get logged-in admin profile
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin profile fetched successfully
 */
router.get("/profile", protect, getAdminProfile);

/**
 * @swagger
 * /api/admin/mydb-user:
 *   get:
 *     summary: Get linked MyDB user for admin
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Linked MyDB user fetched
 */
router.get("/mydb-user", protect, getLinkedMydbUser);

/**
 * @swagger
 * /api/admin/latest-mydb-user:
 *   get:
 *     summary: Get latest MyDB user
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Latest MyDB user fetched
 */
router.get("/latest-mydb-user", protect, getLatestMydbUser);

/**
 * @swagger
 * /api/admin/total-users:
 *   get:
 *     summary: Get total number of users
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Total users count retrieved
 */
router.get("/total-users", protect, getTotalUsers);

/**
 * @swagger
 * /api/admin/all-users:
 *   get:
 *     summary: Get all users list
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 */
router.get("/all-users", protect, getAllUsers);

/**
 * @swagger
 * /api/admin/user-profile/{userId}:
 *   get:
 *     summary: Get a single user's profile by ID
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user
 *     responses:
 *       200:
 *         description: User profile fetched
 */
router.get("/user-profile/:userId", protect, getUserProfile);

export default router;
