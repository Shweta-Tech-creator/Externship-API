import express from "express";
import { createApplication, getApplications, updateApplicationStatus, getStudentApplications, getStudentsWithApprovedApplications } from "../controllers/applicationController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Applications
 *   description: Application management APIs
 */

/**
 * @swagger
 * /api/application:
 *   post:
 *     summary: Create a new application (Public)
 *     tags: [Applications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Application created
 */
router.post("/", createApplication);

/**
 * @swagger
 * /api/application/student/{studentId}:
 *   get:
 *     summary: Get applications for a student (Public)
 *     tags: [Applications]
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Student applications fetched
 */
router.get("/student/:studentId", getStudentApplications);

/**
 * @swagger
 * /api/application:
 *   get:
 *     summary: Get all applications (Admin only)
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Applications fetched
 */
router.get("/", protect, getApplications);

/**
 * @swagger
 * /api/application/{id}/status:
 *   put:
 *     summary: Update application status (Admin only)
 *     tags: [Applications]
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
 *         description: Application status updated
 */
router.put("/:id/status", protect, updateApplicationStatus);

/**
 * @swagger
 * /api/application/approved-students:
 *   get:
 *     summary: Get students with approved applications (Admin only)
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Approved students fetched
 */
router.get("/approved-students", protect, getStudentsWithApprovedApplications);

export default router;