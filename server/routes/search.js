import express from 'express'
import { AgentManager } from '../agents/AgentManager.js'
import { validateSearchParams } from '../middleware/validation.js'
import { logger } from '../utils/logger.js'

const router = express.Router()
const agentManager = new AgentManager()

// Enhanced search endpoint with AI
router.post('/search', validateSearchParams, async (req, res) => {
  try {
    const filters = req.body
    logger.info('AI-enhanced search request received:', filters)

    const startTime = Date.now()
    const results = await agentManager.searchAllPlatforms(filters)
    const processingTime = Date.now() - startTime
    
    logger.info(`AI search completed in ${processingTime}ms. Found ${results.results.length} results`)
    
    res.json({
      success: true,
      data: results.results,
      analysis: results.analysis,
      recommendations: results.recommendations,
      metadata: {
        processingTime,
        timestamp: new Date().toISOString(),
        aiEnhanced: true
      }
    })
  } catch (error) {
    logger.error('AI search error:', error)
    res.status(500).json({ 
      success: false,
      error: 'Search failed', 
      message: error.message 
    })
  }
})

// Market insights endpoint
router.post('/insights', validateSearchParams, async (req, res) => {
  try {
    const filters = req.body
    logger.info('Market insights request:', filters)

    const insights = await agentManager.getMarketInsights(filters)
    
    res.json({
      success: true,
      insights,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    logger.error('Market insights error:', error)
    res.status(500).json({ 
      success: false,
      error: 'Insights generation failed', 
      message: error.message 
    })
  }
})

// Get supported platforms with AI features
router.get('/platforms', (req, res) => {
  const platforms = agentManager.getSupportedPlatforms()
  res.json({
    success: true,
    platforms,
    aiFeatures: {
      intelligentMatching: true,
      priceAnalysis: true,
      anomalyDetection: true,
      recommendations: true
    }
  })
})

// Enhanced agent status endpoint
router.get('/agents/status', (req, res) => {
  const status = agentManager.getAgentStatus()
  res.json({
    success: true,
    status
  })
})

// AI health check
router.get('/ai/health', async (req, res) => {
  try {
    const aiEnabled = process.env.AI_ENABLED === 'true' && process.env.OPENAI_API_KEY
    
    res.json({
      success: true,
      ai: {
        enabled: aiEnabled,
        openaiConfigured: !!process.env.OPENAI_API_KEY,
        features: {
          queryEnhancement: aiEnabled,
          priceAnalysis: aiEnabled,
          recommendations: aiEnabled,
          anomalyDetection: aiEnabled
        }
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'AI health check failed',
      message: error.message
    })
  }
})

export { router as searchRoutes }