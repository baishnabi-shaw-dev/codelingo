import express from 'express';
import { analyzeCode, getAnalysisHistory } from '../controllers/analysisController.js';
import { authenticate } from '../middleware/auth.js';
import { aiLimiter } from '../middleware/rateLimiter.js';
import { validateCode, validateLanguage, handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

router.post(
  '/analyze',
  authenticate,
  aiLimiter,
  validateCode,
  validateLanguage,
  handleValidationErrors,
  analyzeCode
);

router.get('/history', authenticate, getAnalysisHistory);

export default router;
