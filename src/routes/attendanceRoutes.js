import express from "express";
import {
  getAllUsers,
  markAttendance,
  getAttendanceByDate,
  getAttendanceStats,
  getAttendanceRecords,
  getAttendanceRecordsCount,
} from "../controllers/attendanceController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Attendance
 *   description: Attendance API
 */

router.use(authMiddleware);

/**
 * @swagger
 * /api/attendance/records:
 *   get:
 *     summary: Get all attendance records
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Attendance records fetched
 */
router.get("/records", getAttendanceRecords);

/**
 * @swagger
 * /api/attendance/records/count:
 *   get:
 *     summary: Get attendance count
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Attendance record count fetched
 */
router.get("/records/count", getAttendanceRecordsCount);

/**
 * @swagger
 * /api/attendance:
 *   get:
 *     summary: Get all users with attendance data
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Users fetched
 */
router.get("/", getAllUsers);

/**
 * @swagger
 * /api/attendance:
 *   post:
 *     summary: Mark attendance
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *     responses:
 *       201:
 *         description: Attendance marked
 */
router.post("/", markAttendance);

/**
 * @swagger
 * /api/attendance/{date}:
 *   get:
 *     summary: Get attendance for a specific date
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Attendance for given date
 */
router.get("/:date", getAttendanceByDate);

/**
 * @swagger
 * /api/attendance/stats/{period}:
 *   get:
 *     summary: Get attendance statistics (daily/weekly/monthly)
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: period
 *         required: true
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly]
 *     responses:
 *       200:
 *         description: Attendance stats
 */
router.get("/stats/:period", getAttendanceStats);

export default router;
