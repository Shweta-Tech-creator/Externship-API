export default function errorHandler(err, req, res, next) {
  const status = err.status || 500
  const message = err.message || 'Server error'
  if (status >= 500) console.error('Unhandled error:', err)
  res.status(status).json({ message })
}
