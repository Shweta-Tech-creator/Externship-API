import express from "express";
import { getUsers, getUserById, getUsersCountPublic, getRecentLogins } from "../controllers/userController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management APIs
 */

/**
 * @swagger
 * /api/users/count:
 *   get:
 *     summary: Get total user count (public)
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Total user count fetched
 */
router.get("/count", getUsersCountPublic);

/**
 * @swagger
 * /api/users/recent-logins:
 *   get:
 *     summary: Get recent user logins (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of recently logged in users
 */
router.get("/recent-logins", authMiddleware, getRecentLogins);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 */
router.get("/", authMiddleware, getUsers);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get a single user by ID (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User profile fetched
 */
router.get("/:id", authMiddleware, getUserById);

export default router;