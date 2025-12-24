import fs from 'fs'
import path from 'path'
import Profile from '../models/Profile.js'
import cloudinary from '../config/cloudinary.js'

export async function getMyProfile(req, res) {
  const uid = (req.user && (req.user.sub || req.user.id))
  console.log('Profile lookup - User ID:', uid)
  console.log('Profile lookup - Full user object:', JSON.stringify(req.user, null, 2))
  
  if (!uid) {
    console.log('No user ID found in request')
    return res.status(401).json({ message: 'User not authenticated' })
  }
  
  const profile = await Profile.findOne({ user: uid })
  console.log('Profile found:', profile ? 'YES' : 'NO')
  if (profile) {
    console.log('Profile data:', JSON.stringify(profile, null, 2))
    // Verify the profile email matches the authenticated user email
    if (req.user.email && profile.email && profile.email !== req.user.email) {
      console.log('Profile email mismatch detected:', {
        profileEmail: profile.email,
        userEmail: req.user.email
      })
      // Clear the mismatched profile and return empty
      await Profile.deleteOne({ user: uid })
      return res.json({})
    }
  }
  
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private')
  if (!profile) return res.json({})
  return res.json(profile.toJSON())
}

export async function deleteResume(req, res) {
  try {
    const uid = (req.user && (req.user.sub || req.user.id))
    const profile = await Profile.findOne({ user: uid })
    if (!profile || !profile.resumePath) {
      return res.status(404).json({ message: 'No resume to delete' })
    }
    
    // Delete from Cloudinary if it has a cloudinaryPublicId
    try {
      if (profile.resumeCloudinaryPublicId) {
        await cloudinary.v2.uploader.destroy(profile.resumeCloudinaryPublicId, {
          resource_type: profile.resumeCloudinaryResourceType || 'auto'
        })
      }
      // Try to delete local files only (for backward compatibility)
      if (profile.resumePath && profile.resumePath.startsWith('/uploads')) {
        const abs = path.join(process.cwd(), profile.resumePath)
        if (fs.existsSync(abs)) fs.unlinkSync(abs)
      }
    } catch (deleteError) {
      console.error('Failed to delete resume from Cloudinary:', deleteError)
      // Continue with database deletion even if Cloudinary deletion fails
    }
    
    profile.resumePath = undefined
    profile.resumeCloudinaryPublicId = undefined
    profile.resumeCloudinaryResourceType = undefined
    await profile.save()
    res.json({ ok: true })
  } catch (err) {
    console.error('Delete resume error:', err)
    return res.status(500).json({ message: 'Failed to delete resume' })
  }
}

export async function upsertMyProfile(req, res) {
  const uid = (req.user && (req.user.sub || req.user.id))
  if (!uid) {
    return res.status(401).json({ message: 'User not authenticated' })
  }

  const { fullName, email, linkedInUrl, courseBranchGradYear, skills, mobile } = req.body || {}
  
  // Validate that the email being saved matches the authenticated user's email
  if (email && req.user.email && email !== req.user.email) {
    console.log('Email mismatch in profile update:', {
      requestedEmail: email,
      userEmail: req.user.email
    })
    return res.status(403).json({ message: 'Cannot change profile email' })
  }
  
  let skillsArray = []
  if (Array.isArray(skills)) skillsArray = skills
  else if (typeof skills === 'string' && skills.trim()) skillsArray = skills.split(',').map(s => s.trim()).filter(Boolean)

  const update = {}
  if (fullName !== undefined) update.fullName = fullName
  if (email !== undefined) update.email = email
  if (linkedInUrl !== undefined) update.linkedInUrl = linkedInUrl
  if (courseBranchGradYear !== undefined) update.courseBranchGradYear = courseBranchGradYear
  if (skillsArray.length) update.skills = skillsArray
  if (mobile !== undefined) update.mobile = mobile
  
  // Handle resume upload
  if (req.cloudinaryResult) {
    update.resumePath = req.cloudinaryResult.secure_url
    update.resumeCloudinaryPublicId = req.cloudinaryResult.public_id
    update.resumeCloudinaryResourceType = req.cloudinaryResult.resource_type
  } else if (req.file) {
    // Fallback for local files (backward compatibility)
    update.resumePath = (req.file && req.file.path) || `/uploads/${req.file.filename}`
  }

  const profile = await Profile.findOneAndUpdate(
    { user: uid },
    { $set: update, $setOnInsert: { user: uid } },
    { new: true, upsert: true }
  )
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private')
  return res.status(200).json(profile.toJSON())
}

export async function uploadAvatar(req, res) {
  try {
    if (!req.cloudinaryResult) {
      return res.status(400).json({ message: 'No file uploaded successfully' })
    }
    
    const url = req.cloudinaryResult.secure_url
    const uid = (req.user && (req.user.sub || req.user.id))
    
    // Delete old avatar from Cloudinary if it exists
    try {
      const existingProfile = await Profile.findOne({ user: uid })
      if (existingProfile && existingProfile.avatarCloudinaryPublicId) {
        await cloudinary.v2.uploader.destroy(existingProfile.avatarCloudinaryPublicId, {
          resource_type: existingProfile.avatarCloudinaryResourceType || 'image'
        })
      }
    } catch (deleteError) {
      console.error('Failed to delete old avatar from Cloudinary:', deleteError)
      // Continue with new avatar upload even if deletion fails
    }
    
    const profile = await Profile.findOneAndUpdate(
      { user: uid },
      { 
        $set: { 
          avatarUrl: url,
          avatarCloudinaryPublicId: req.cloudinaryResult.public_id,
          avatarCloudinaryResourceType: req.cloudinaryResult.resource_type
        }, 
        $setOnInsert: { user: uid } 
      },
      { new: true, upsert: true }
    )
    return res.status(200).json({ avatarUrl: profile.avatarUrl })
  } catch (err) {
    console.error('Upload avatar error:', err)
    return res.status(500).json({ message: 'Failed to upload avatar' })
  }
}
