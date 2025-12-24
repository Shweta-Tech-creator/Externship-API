import express from "express";
import {
  createInternship,
  getInternships,
  getInternship,
  updateInternship,
  deleteInternship,
  getPublicInternships,
} from "../controllers/internshipController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Internships
 *   description: Internship management APIs
 */

/**
 * @swagger
 * /api/internship/public:
 *   get:
 *     summary: Get public internships (student-facing)
 *     tags: [Internships]
 *     responses:
 *       200:
 *         description: List of public internships
 */
router.get("/public", getPublicInternships);

/**
 * @swagger
 * /api/internship:
 *   post:
 *     summary: Create a new internship (Admin only)
 *     tags: [Internships]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Internship created
 */
router.post("/", protect, createInternship);

/**
 * @swagger
 * /api/internship:
 *   get:
 *     summary: Get all internships (Admin only)
 *     tags: [Internships]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of internships
 */
router.get("/", protect, getInternships);

/**
 * @swagger
 * /api/internship/{id}:
 *   get:
 *     summary: Get internship by ID
 *     tags: [Internships]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Internship fetched
 */
router.get("/:id", protect, getInternship);

/**
 * @swagger
 * /api/internship/{id}:
 *   put:
 *     summary: Update internship (Admin only)
 *     tags: [Internships]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Internship updated
 */
router.put("/:id", protect, updateInternship);

/**
 * @swagger
 * /api/internship/{id}:
 *   delete:
 *     summary: Delete internship (Admin only)
 *     tags: [Internships]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Internship deleted
 */
router.delete("/:id", protect, deleteInternship);

export default router;
