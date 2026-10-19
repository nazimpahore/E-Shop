import { body, query } from 'express-validator';

export const productCreateValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Product category is required'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('stockCount')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock count must be a non-negative integer')
];

export const productQueryValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 200 })
    .withMessage('Limit must be between 1 and 200'),
  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum price must be a non-negative number'),
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum price must be a non-negative number'),
  query('minRating')
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage('Minimum rating must be between 0 and 5'),
  query('sortBy')
    .optional()
    .isIn(['featured', 'price-asc', 'price-desc', 'rating', 'newest'])
    .withMessage('Invalid sort parameter')
];
