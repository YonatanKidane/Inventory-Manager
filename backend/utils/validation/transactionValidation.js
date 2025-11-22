const { body, param, query } = require("express-validator");

const getTransactionsValidation = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
  query("productId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Product ID must be a positive integer"),
  query("type")
    .optional()
    .isIn(["in", "out"])
    .withMessage("Type must be either 'in' or 'out'"),
];

const getTransactionValidation = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("Transaction ID must be a positive integer"),
];

const createTransactionValidation = [
  body("type")
    .isIn(["in", "out"])
    .withMessage("Type must be either 'in' or 'out'"),
  body("quantity")
    .isInt({ min: 1 })
    .withMessage("Quantity must be a positive integer"),
  body("reason")
    .optional()
    .isString()
    .trim()
    .isLength({ max: 255 })
    .withMessage("Reason must be a string with max 255 characters"),
  body("productId")
    .isInt({ min: 1 })
    .withMessage("Product ID must be a positive integer"),
];

const updateTransactionValidation = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("Transaction ID must be a positive integer"),
  body("type")
    .optional()
    .isIn(["in", "out"])
    .withMessage("Type must be either 'in' or 'out'"),
  body("quantity")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Quantity must be a positive integer"),
  body("reason")
    .optional()
    .isString()
    .trim()
    .isLength({ max: 255 })
    .withMessage("Reason must be a string with max 255 characters"),
  body("productId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Product ID must be a positive integer"),
];

const deleteTransactionValidation = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("Transaction ID must be a positive integer"),
];

module.exports = {
  getTransactionsValidation,
  getTransactionValidation,
  createTransactionValidation,
  updateTransactionValidation,
  deleteTransactionValidation,
};
