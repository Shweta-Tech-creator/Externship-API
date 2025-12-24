import { Router } from 'express';
import { submit, list } from '../controllers/contactController.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Contact
 *   description: Contact/Support APIs
 */

/**
 * @swagger
 * /api/contact:
 *   post:
 *     summary: Submit a contact message
 *     tags: [Contact]
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
 *               message:
 *                 type: string
 *     responses:
 *       201:
 *         description: Message submitted successfully
 */
router.post('/', submit);

/**
 * @swagger
 * /api/contact:
 *   get:
 *     summary: List all contact messages
 *     tags: [Contact]
 *     responses:
 *       200:
 *         description: List of messages fetched
 */
router.get('/', list);

export default router;
