import { Router } from 'express';
import { verifyToken } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import AIService from '../services/aiService.js';

const router = Router();

// Chat endpoint
router.post('/chat', verifyToken, asyncHandler(async (req, res) => {
  const { message } = req.body;
  
  if (!message || typeof message !== 'string') {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_INPUT', message: 'Message is required' }
    });
  }

  const response = await AIService.chat(req.user!.userId, message);
  
  res.json({
    success: true,
    data: { message: response }
  });
}));

// Insights endpoint
router.get('/insights/:employeeId', verifyToken, asyncHandler(async (req, res) => {
  const insights = await AIService.generateInsights(req.params.employeeId);
  
  res.json({
    success: true,
    data: { insights }
  });
}));

export default router;
