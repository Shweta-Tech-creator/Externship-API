import 'dotenv/config'
import cloudinary from 'cloudinary'

const {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
} = process.env

if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  console.warn('Cloudinary not fully configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in .env')
  console.warn('CLOUDINARY_CLOUD_NAME:', CLOUDINARY_CLOUD_NAME)
  console.warn('CLOUDINARY_API_KEY:', CLOUDINARY_API_KEY ? 'exists' : 'missing')
  console.warn('CLOUDINARY_API_SECRET:', CLOUDINARY_API_SECRET ? 'exists' : 'missing')
}

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
  secure: true,
})

// Verify configuration
console.log('Cloudinary configured with cloud_name:', cloudinary.config().cloud_name)
console.log('Cloudinary v2 available:', !!cloudinary.v2)
console.log('Cloudinary uploader available:', !!cloudinary.v2?.uploader)

export default cloudinary
