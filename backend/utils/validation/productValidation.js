const { body, param, query } = require('express-validator');

const createProductValidation = [
  body('name')
    .isLength({ min: 1, max: 255 })
    .withMessage('Product name must be between 1 and 255 characters'),

  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),

  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),

  body('quantity')
    .isInt({ min: 0 })
    .withMessage('Quantity must be a non-negative integer'),

  body('lowStockThreshold')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Low stock threshold must be a non-negative integer'),

  body('category')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Category cannot exceed 100 characters'),

  body('shopId')
    .isInt({ min: 1 })
    .withMessage('Shop ID must be a valid integer'),
];

const updateProductValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Product ID must be a valid integer'),

  body('name')
    .optional()
    .isLength({ min: 1, max: 255 })
    .withMessage('Product name must be between 1 and 255 characters'),

  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),

  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),

  body('quantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Quantity must be a non-negative integer'),

  body('lowStockThreshold')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Low stock threshold must be a non-negative integer'),

  body('category')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Category cannot exceed 100 characters'),

  body('shopId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Shop ID must be a valid integer'),
];

const getProductValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Product ID must be a valid integer'),
];

const deleteProductValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Product ID must be a valid integer'),
];

const getProductsValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('category')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Category filter cannot exceed 100 characters'),

  query('lowStock')
    .optional()
    .isBoolean()
    .withMessage('Low stock filter must be a boolean'),
];

module.exports = {
  createProductValidation,
  updateProductValidation,
  getProductValidation,
  deleteProductValidation,
  getProductsValidation,
};
