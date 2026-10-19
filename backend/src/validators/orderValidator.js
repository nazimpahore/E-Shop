import { body } from 'express-validator';

export const orderCreateValidator = [
  body('customer.fullName')
    .trim()
    .notEmpty()
    .withMessage('Customer full name is required'),
  body('customer.email')
    .trim()
    .notEmpty()
    .withMessage('Customer email is required')
    .isEmail()
    .withMessage('Valid customer email is required'),
  body('shippingAddress.fullName')
    .trim()
    .notEmpty()
    .withMessage('Recipient name is required'),
  body('shippingAddress.addressLine1')
    .trim()
    .notEmpty()
    .withMessage('Shipping street address is required'),
  body('shippingAddress.city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  body('shippingAddress.state')
    .trim()
    .notEmpty()
    .withMessage('State / Province is required'),
  body('shippingAddress.postalCode')
    .trim()
    .notEmpty()
    .withMessage('Postal / ZIP code is required'),
  body('items')
    .isArray({ min: 1 })
    .withMessage('Order must contain at least one item')
];
