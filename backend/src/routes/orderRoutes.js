import { Router } from 'express';
import { orderController } from '../controllers/orderController.js';
import { protect, optionalAuth } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import { orderCreateValidator } from '../validators/orderValidator.js';

const router = Router();

// Order submission (links to user if logged in, accepts guest orders)
router.post('/', optionalAuth, orderCreateValidator, validate, orderController.createOrder);

// Authenticated user orders list
router.get('/my-orders', protect, orderController.getMyOrders);

// Single order receipt / details
router.get('/:id', optionalAuth, orderController.getOrderById);

export default router;
