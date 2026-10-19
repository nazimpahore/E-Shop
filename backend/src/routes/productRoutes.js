import { Router } from 'express';
import { productController } from '../controllers/productController.js';
import { reviewController } from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import { productQueryValidator } from '../validators/productValidator.js';

const router = Router();

// Catalog query endpoints
router.get('/', productQueryValidator, validate, productController.getProducts);
router.get('/featured', productController.getFeaturedProducts);
router.get('/trending', productController.getTrendingProducts);
router.get('/related', productController.getRelatedProducts);

// Single product details
router.get('/:id', productController.getProductById);

// Reviews for a product
router.get('/:productId/reviews', reviewController.getProductReviews);
router.post('/:productId/reviews', protect, reviewController.createReview);

export default router;
