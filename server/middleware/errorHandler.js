import { logger } from '../utils/logger.js'

export const errorHandler = (err, req, res, next) => {
  logger.error('Unhandled error:', err)

  // Default error response
  let statusCode = 500
  let message = 'Internal server error'

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400
    message = err.message
  } else if (err.name === 'CastError') {
    statusCode = 400
    message = 'Invalid data format'
  } else if (err.code === 'ECONNREFUSED') {
    statusCode = 503
    message = 'Service temporarily unavailable'
  } else if (err.message) {
    message = err.message
  }

  res.status(statusCode).json({
    error: 'Server Error',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
}