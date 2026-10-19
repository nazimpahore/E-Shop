import { Router } from 'express';
import { categoryController } from '../controllers/categoryController.js';

const router = Router();

router.get('/', categoryController.getCategories);
router.get('/:slug', categoryController.getCategoryBySlug);

export default router;
