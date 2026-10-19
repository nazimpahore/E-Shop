import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import { authRateLimiter } from '../middleware/rateLimitMiddleware.js';
import {
  registerValidator,
  loginValidator,
  updateProfileValidator,
  addressValidator,
  forgotPasswordValidator,
  resetPasswordValidator
} from '../validators/authValidator.js';

const router = Router();

// Public routes with rate limiting
router.post('/register', authRateLimiter, registerValidator, validate, authController.register);
router.post('/login', authRateLimiter, loginValidator, validate, authController.login);
router.post('/logout', authController.logout);
router.post('/forgot-password', authRateLimiter, forgotPasswordValidator, validate, authController.forgotPassword);
router.post('/reset-password', authRateLimiter, resetPasswordValidator, validate, authController.resetPassword);

// Protected routes
router.get('/me', protect, authController.getMe);
router.put('/profile', protect, updateProfileValidator, validate, authController.updateProfile);
router.post('/addresses', protect, addressValidator, validate, authController.addAddress);
router.put('/addresses/:id', protect, addressValidator, validate, authController.updateAddress);
router.delete('/addresses/:id', protect, authController.deleteAddress);

export default router;
