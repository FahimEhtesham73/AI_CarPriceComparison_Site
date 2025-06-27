export const validateSearchParams = (req, res, next) => {
  const { model, brand, year, minPrice, maxPrice } = req.body

  // Validate required fields
  if (!model || model.trim().length === 0) {
    return res.status(400).json({
      error: 'Validation failed',
      message: 'Car model is required'
    })
  }

  // Validate year if provided
  if (year && (isNaN(year) || year < 1990 || year > new Date().getFullYear() + 1)) {
    return res.status(400).json({
      error: 'Validation failed',
      message: 'Invalid year provided'
    })
  }

  // Validate price range if provided
  if (minPrice && (isNaN(minPrice) || minPrice < 0)) {
    return res.status(400).json({
      error: 'Validation failed',
      message: 'Invalid minimum price'
    })
  }

  if (maxPrice && (isNaN(maxPrice) || maxPrice < 0)) {
    return res.status(400).json({
      error: 'Validation failed',
      message: 'Invalid maximum price'
    })
  }

  if (minPrice && maxPrice && parseInt(minPrice) > parseInt(maxPrice)) {
    return res.status(400).json({
      error: 'Validation failed',
      message: 'Minimum price cannot be greater than maximum price'
    })
  }

  // Sanitize inputs
  req.body.model = model.trim()
  if (brand) req.body.brand = brand.trim()

  next()
}