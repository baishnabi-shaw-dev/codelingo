import express from 'express';
import { body, param } from 'express-validator';
import {
  updateApiKey,
  setPreferredProvider,
  getSettings,
  deleteApiKey,
} from '../controllers/settingsController.js';
import { authenticate } from '../middleware/auth.js';
import { handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

const validProviders = ['groq', 'gemini', 'openrouter'];

router.post(
  '/api-key',
  authenticate,
  body('provider').isIn(validProviders).withMessage('Invalid provider'),
  body('apiKey').isString().trim().notEmpty().withMessage('API key is required'),
  body('consentAccepted').equals('true').withMessage('AI provider consent is required'),
  body('consentText').isString().trim().notEmpty().withMessage('Consent text is required'),
  handleValidationErrors,
  updateApiKey
);
router.delete(
  '/api-key/:provider',
  authenticate,
  param('provider').isIn(validProviders).withMessage('Invalid provider'),
  handleValidationErrors,
  deleteApiKey
);
router.post(
  '/provider',
  authenticate,
  body('provider').isIn(validProviders).withMessage('Invalid provider'),
  handleValidationErrors,
  setPreferredProvider
);
router.get('/', authenticate, getSettings);

export default router;
