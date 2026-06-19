import express from 'express';
import { register, login, getCurrentUser } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { validateEmail, validatePassword, validateUsername, handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

router.post(
  '/register',
  validateEmail,
  validateUsername,
  validatePassword,
  handleValidationErrors,
  register
);

router.post('/login', validateEmail, validatePassword, handleValidationErrors, login);

router.get('/me', authenticate, getCurrentUser);

export default router;
