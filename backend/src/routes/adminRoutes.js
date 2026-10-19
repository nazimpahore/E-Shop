import { Router } from 'express';
import { adminController } from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import { productCreateValidator } from '../validators/productValidator.js';

const router = Router();

// Protect all admin endpoints with admin role authorization
router.use(protect, authorize('admin'));

// Analytics & Dashboard
router.get('/stats', adminController.getDashboardStats);

// Product management
router.post('/products', productCreateValidator, validate, adminController.createProduct);
router.put('/products/:id', adminController.updateProduct);
router.delete('/products/:id', adminController.deleteProduct);
router.patch('/products/:id/stock', adminController.updateStock);

// Order management
router.get('/orders', adminController.getAllOrders);
router.patch('/orders/:id/status', adminController.updateOrderStatus);

// Customer management
router.get('/users', adminController.getAllUsers);

// Category management
router.post('/categories', adminController.createCategory);

export default router;
