import express from 'express';
import { convertCode, getSupportedConversions } from '../controllers/conversionController.js';
import { authenticate } from '../middleware/auth.js';
import { body } from 'express-validator';
import { handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

router.get('/supported', getSupportedConversions);

router.post(
  '/convert',
  authenticate,
  body('sourceCode').notEmpty().withMessage('Source code is required'),
  body('fromLanguage').notEmpty().withMessage('Source language is required'),
  body('toLanguage').notEmpty().withMessage('Target language is required'),
  handleValidationErrors,
  convertCode
);

export default router;
