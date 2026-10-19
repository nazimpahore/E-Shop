import { Router } from 'express';
import { cartController } from '../controllers/cartController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

// All cart operations require authenticated customer
router.use(protect);

router.get('/', cartController.getCart);
router.post('/items', cartController.addToCart);
router.patch('/items/:itemId', cartController.updateCartItem);
router.delete('/items/:itemId', cartController.removeCartItem);
router.delete('/', cartController.clearCart);
router.post('/merge', cartController.mergeCart);

export default router;
