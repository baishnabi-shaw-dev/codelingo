import express from 'express';
import { executeCode, getExecutionHistory } from '../controllers/codeController.js';
import { authenticate } from '../middleware/auth.js';
import { codeLimiter } from '../middleware/rateLimiter.js';
import { validateCode, validateLanguage, handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

router.post('/execute', authenticate, codeLimiter, validateCode, validateLanguage, handleValidationErrors, executeCode);

router.get('/history', authenticate, getExecutionHistory);

export default router;
