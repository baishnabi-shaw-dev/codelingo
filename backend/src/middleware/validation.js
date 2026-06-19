import { body, validationResult } from 'express-validator';

export const validateEmail = body('email').isEmail().normalizeEmail();
export const validatePassword = body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters');
export const validateUsername = body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters');
export const validateCode = body('code').notEmpty().withMessage('Code is required');
export const validateLanguage = body('language').notEmpty().withMessage('Language is required');

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
