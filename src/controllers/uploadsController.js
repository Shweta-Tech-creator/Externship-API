import fs from 'fs'
import path from 'path'
import Project from '../models/Project.js'
import Certificate from '../models/Certificate.js'
import ProjectFile from '../models/ProjectFile.js'
import cloudinary from '../config/cloudinary.js'

// Projects
export const listProjects = async (req, res, next) => {
  try {
    const uid = (req.user && (req.user.sub || req.user.id))
    const items = await Project.find({ user: uid }).sort({ createdAt: -1 })
    res.json(items)
  } catch (e) { next(e) }
}

export const createProject = async (req, res, next) => {
  try {
    const { title, description, githubUrl, demoUrl } = req.body
    if (!title) return res.status(400).json({ message: 'Title is required' })
    const uid = (req.user && (req.user.sub || req.user.id))
    const item = await Project.create({ user: uid, title, description, githubUrl, demoUrl })
    res.status(201).json(item)
  } catch (e) { next(e) }
}

export const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params
    const uid = (req.user && (req.user.sub || req.user.id))
    const found = await Project.findOne({ _id: id, user: uid })
    if (!found) return res.status(404).json({ message: 'Not found' })
    await Project.deleteOne({ _id: id })
    res.json({ ok: true })
  } catch (e) { next(e) }
}

// Certificates
export const listCertificates = async (req, res, next) => {
  try {
    const uid = (req.user && (req.user.sub || req.user.id))
    const items = await Certificate.find({ user: uid }).sort({ createdAt: -1 })
    res.json(items)
  } catch (e) { next(e) }
}

export const uploadCertificate = async (req, res, next) => {
  try {
    if (!req.cloudinaryResult) {
      return res.status(400).json({ message: 'No file uploaded successfully' })
    }
    const uid = (req.user && (req.user.sub || req.user.id))
    if (!uid) return res.status(401).json({ message: 'Missing authenticated user' })
    
    const cert = await Certificate.create({
      user: uid,
      originalName: req.file.originalname,
      filePath: req.cloudinaryResult.secure_url,
      mimeType: req.file.mimetype,
      size: req.file.size,
      cloudinaryPublicId: req.cloudinaryResult.public_id,
      cloudinaryResourceType: req.cloudinaryResult.resource_type,
    })
    res.status(201).json(cert)
  } catch (e) { 
    console.error('Certificate controller error:', e)
    next(e) 
  }
}

export const deleteCertificate = async (req, res, next) => {
  try {
    const { id } = req.params
    const uid = (req.user && (req.user.sub || req.user.id))
    const cert = await Certificate.findOne({ _id: id, user: uid })
    if (!cert) return res.status(404).json({ message: 'Not found' })
    
    // Delete from Cloudinary if it has a cloudinaryPublicId
    try {
      if (cert.cloudinaryPublicId) {
        await cloudinary.v2.uploader.destroy(cert.cloudinaryPublicId, {
          resource_type: cert.cloudinaryResourceType || 'image'
        })
      }
      // remove file from disk if exists (for backward compatibility)
      if (cert.filePath && cert.filePath.startsWith('/uploads')) {
        const abs = path.join(process.cwd(), cert.filePath)
        if (fs.existsSync(abs)) fs.unlinkSync(abs)
      }
    } catch (deleteError) {
      console.error('Failed to delete from Cloudinary:', deleteError)
      // Continue with database deletion even if Cloudinary deletion fails
    }
    
    await Certificate.deleteOne({ _id: id })
    res.json({ ok: true })
  } catch (e) { 
    console.error('Delete certificate error:', e)
    next(e) 
  }
}

// Project Files
export const listProjectFiles = async (req, res, next) => {
  try {
    const uid = (req.user && (req.user.sub || req.user.id))
    const items = await ProjectFile.find({ user: uid }).sort({ createdAt: -1 })
    res.json(items)
  } catch (e) { next(e) }
}

export const uploadProjectFile = async (req, res, next) => {
  try {
    if (!req.cloudinaryResult) {
      return res.status(400).json({ message: 'No file uploaded successfully' })
    }
    const uid = (req.user && (req.user.sub || req.user.id))
    if (!uid) return res.status(401).json({ message: 'Missing authenticated user' })
    
    const item = await ProjectFile.create({
      user: uid,
      originalName: req.file.originalname,
      filePath: req.cloudinaryResult.secure_url,
      mimeType: req.file.mimetype,
      size: req.file.size,
      cloudinaryPublicId: req.cloudinaryResult.public_id,
      cloudinaryResourceType: req.cloudinaryResult.resource_type,
    })
    res.status(201).json(item)
  } catch (e) { 
    console.error('Project file controller error:', e)
    next(e) 
  }
}

export const deleteProjectFile = async (req, res, next) => {
  try {
    const { id } = req.params
    const uid = (req.user && (req.user.sub || req.user.id))
    const item = await ProjectFile.findOne({ _id: id, user: uid })
    if (!item) return res.status(404).json({ message: 'Not found' })
    
    // Delete from Cloudinary if it has a cloudinaryPublicId
    try {
      if (item.cloudinaryPublicId) {
        await cloudinary.v2.uploader.destroy(item.cloudinaryPublicId, {
          resource_type: item.cloudinaryResourceType || 'auto'
        })
      }
      // remove file from disk if exists (for backward compatibility)
      if (item.filePath && item.filePath.startsWith('/uploads')) {
        const abs = path.join(process.cwd(), item.filePath)
        if (fs.existsSync(abs)) fs.unlinkSync(abs)
      }
    } catch (deleteError) {
      console.error('Failed to delete from Cloudinary:', deleteError)
      // Continue with database deletion even if Cloudinary deletion fails
    }
    
    await ProjectFile.deleteOne({ _id: id })
    res.json({ ok: true })
  } catch (e) { 
    console.error('Delete project file error:', e)
    next(e) 
  }
}
