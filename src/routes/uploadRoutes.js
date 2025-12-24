import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import { requireAuth } from '../middleware/auth.js'
import { 
  listProjects, createProject, deleteProject, 
  listCertificates, uploadCertificate, deleteCertificate, 
  listProjectFiles, uploadProjectFile, deleteProjectFile 
} from '../controllers/uploadsController.js'
import cloudinary from '../config/cloudinary.js'

const router = Router()

// Configure multer
const storage = multer.memoryStorage()

const certFileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
  if (allowedTypes.includes(file.mimetype)) cb(null, true)
  else cb(new Error('Invalid file type. Only JPG, PNG, and PDF files are allowed for certificates.'), false)
}

const projFileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf', 'application/zip', 'application/x-zip-compressed']
  if (allowedTypes.includes(file.mimetype)) cb(null, true)
  else cb(new Error('Invalid file type. Only JPG, PNG, PDF, and ZIP files are allowed for projects.'), false)
}

const uploadCert = multer({ storage, limits: { fileSize: 15 * 1024 * 1024 }, fileFilter: certFileFilter })
const uploadProject = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 }, fileFilter: projFileFilter })

const uploadToCloudinary = (buffer, folder, publicId, resourceType = 'auto') => {
  return new Promise((resolve, reject) => {
    cloudinary.v2.uploader.upload_stream(
      { folder, public_id: publicId, resource_type: resourceType },
      (error, result) => error ? reject(error) : resolve(result)
    ).end(buffer)
  })
}

/**
 * @swagger
 * tags:
 *   name: Uploads
 *   description: Project, Certificate, and File management
 */

/**
 * @swagger
 * /api/uploads/projects:
 *   get:
 *     summary: List all projects
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Projects listed successfully
 */
router.get('/projects', requireAuth, listProjects)

/**
 * @swagger
 * /api/uploads/projects:
 *   post:
 *     summary: Create a new project
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Project created successfully
 */
router.post('/projects', requireAuth, createProject)

/**
 * @swagger
 * /api/uploads/projects/{id}:
 *   delete:
 *     summary: Delete a project by ID
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Project deleted successfully
 */
router.delete('/projects/:id', requireAuth, deleteProject)

/**
 * @swagger
 * /api/uploads/certificates:
 *   get:
 *     summary: List all certificates
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Certificates listed successfully
 */
router.get('/certificates', requireAuth, listCertificates)

/**
 * @swagger
 * /api/uploads/certificates:
 *   post:
 *     summary: Upload a certificate (JPG, PNG, PDF)
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Certificate uploaded successfully
 */
router.post('/certificates', requireAuth, async (req, res, next) => {
  uploadCert.single('file')(req, res, async (err) => {
    if (err) return res.status(400).json({ message: err.message || 'File upload failed', error: 'UPLOAD_ERROR' })
    if (!req.file) return res.status(400).json({ message: 'No file provided', error: 'NO_FILE' })
    try {
      const base = path.parse(req.file.originalname || 'file').name.replace(/[^a-z0-9-_]/gi, '_')
      const publicId = `cert_${Date.now()}_${base}`
      const result = await uploadToCloudinary(req.file.buffer, 'certificates', publicId)
      req.cloudinaryResult = result
      next()
    } catch (uploadError) {
      return res.status(500).json({ message: 'Failed to upload file', error: 'CLOUDINARY_ERROR' })
    }
  })
}, uploadCertificate)

/**
 * @swagger
 * /api/uploads/certificates/{id}:
 *   delete:
 *     summary: Delete a certificate by ID
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Certificate ID
 *     responses:
 *       200:
 *         description: Certificate deleted successfully
 */
router.delete('/certificates/:id', requireAuth, deleteCertificate)

/**
 * @swagger
 * /api/uploads/project-files:
 *   get:
 *     summary: List all project files
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Project files listed successfully
 */
router.get('/project-files', requireAuth, listProjectFiles)

/**
 * @swagger
 * /api/uploads/project-files:
 *   post:
 *     summary: Upload a project file (JPG, PNG, PDF, ZIP)
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Project file uploaded successfully
 */
router.post('/project-files', requireAuth, async (req, res, next) => {
  uploadProject.single('file')(req, res, async (err) => {
    if (err) return res.status(400).json({ message: err.message || 'File upload failed', error: 'UPLOAD_ERROR' })
    if (!req.file) return res.status(400).json({ message: 'No file provided', error: 'NO_FILE' })
    try {
      const base = path.parse(req.file.originalname || 'file').name.replace(/[^a-z0-9-_]/gi, '_')
      const publicId = `project_${Date.now()}_${base}`
      const result = await uploadToCloudinary(req.file.buffer, 'projects', publicId)
      req.cloudinaryResult = result
      next()
    } catch (uploadError) {
      return res.status(500).json({ message: 'Failed to upload file', error: 'CLOUDINARY_ERROR' })
    }
  })
}, uploadProjectFile)

/**
 * @swagger
 * /api/uploads/project-files/{id}:
 *   delete:
 *     summary: Delete a project file by ID
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project file ID
 *     responses:
 *       200:
 *         description: Project file deleted successfully
 */
router.delete('/project-files/:id', requireAuth, deleteProjectFile)

export default router
