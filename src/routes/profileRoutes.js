import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import { requireAuth } from '../middleware/auth.js'
import { getMyProfile, upsertMyProfile, uploadAvatar, deleteResume } from '../controllers/profileController.js'
import cloudinary from '../config/cloudinary.js'

// Configure multer
const storage = multer.memoryStorage()

const resumeFileFilter = (req, file, cb) => {
  const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  if (allowedTypes.includes(file.mimetype)) cb(null, true)
  else cb(new Error('Invalid file type. Only PDF and DOCX allowed for resumes.'), false)
}

const avatarFileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  if (allowedTypes.includes(file.mimetype)) cb(null, true)
  else cb(new Error('Invalid file type. Only JPG, PNG, GIF, WebP allowed for avatars.'), false)
}

const uploadResume = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 }, fileFilter: resumeFileFilter })
const uploadAvatarOnly = multer({ storage, limits: { fileSize: 3 * 1024 * 1024 }, fileFilter: avatarFileFilter })

const uploadToCloudinary = (buffer, folder, publicId, resourceType = 'auto') => {
  return new Promise((resolve, reject) => {
    cloudinary.v2.uploader.upload_stream(
      { folder, public_id: publicId, resource_type: resourceType },
      (error, result) => {
        if (error) reject(error)
        else resolve(result)
      }
    ).end(buffer)
  })
}

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Profile
 *   description: User profile and uploads
 */

/**
 * @swagger
 * /api/profile/me:
 *   get:
 *     summary: Get current user's profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved
 */
router.get('/me', requireAuth, getMyProfile);

/**
 * @swagger
 * /api/profile/me:
 *   post:
 *     summary: Update profile and optionally upload resume
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               resume:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
router.post('/me', requireAuth, async (req, res, next) => {
  uploadResume.single('resume')(req, res, async (err) => {
    if (err) return res.status(400).json({ message: err.message, error: 'UPLOAD_ERROR' })
    if (!req.file) return upsertMyProfile(req, res, next)
    try {
      const base = path.parse(req.file.originalname || 'resume').name.replace(/[^a-z0-9-_]/gi, '_')
      const publicId = `resume_${Date.now()}_${base}`
      const result = await uploadToCloudinary(req.file.buffer, 'resumes', publicId)
      req.cloudinaryResult = result
      next()
    } catch (uploadError) {
      return res.status(500).json({ message: 'Cloudinary upload failed', error: 'CLOUDINARY_ERROR' })
    }
  })
}, upsertMyProfile);

/**
 * @swagger
 * /api/profile/avatar:
 *   post:
 *     summary: Upload avatar
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Avatar uploaded successfully
 */
router.post('/avatar', requireAuth, async (req, res, next) => {
  uploadAvatarOnly.single('avatar')(req, res, async (err) => {
    if (err) return res.status(400).json({ message: err.message, error: 'UPLOAD_ERROR' })
    if (!req.file) return res.status(400).json({ message: 'No avatar file provided', error: 'NO_FILE' })
    try {
      const base = path.parse(req.file.originalname || 'avatar').name.replace(/[^a-z0-9-_]/gi, '_')
      const publicId = `avatar_${Date.now()}_${base}`
      const result = await uploadToCloudinary(req.file.buffer, 'avatars', publicId, 'image')
      req.cloudinaryResult = result
      next()
    } catch (uploadError) {
      return res.status(500).json({ message: 'Cloudinary upload failed', error: 'CLOUDINARY_ERROR' })
    }
  })
}, uploadAvatar);

/**
 * @swagger
 * /api/profile/resume:
 *   delete:
 *     summary: Delete user's resume
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Resume deleted successfully
 */
router.delete('/resume', requireAuth, deleteResume);

export default router;
