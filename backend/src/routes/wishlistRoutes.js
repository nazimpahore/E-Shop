import { Router } from 'express';
import { wishlistController } from '../controllers/wishlistController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

// Wishlist requires authentication
router.use(protect);

router.get('/', wishlistController.getWishlist);
router.post('/items', wishlistController.addToWishlist);
router.delete('/items/:productId', wishlistController.removeFromWishlist);
router.delete('/', wishlistController.clearWishlist);

export default router;
