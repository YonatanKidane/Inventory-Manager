const { registerValidation, loginValidation } = require("./authValidation");
const {
  createProductValidation,
  updateProductValidation,
  getProductValidation,
  deleteProductValidation,
  getProductsValidation,
} = require("./productValidation");
const {
  getTransactionsValidation,
  getTransactionValidation,
  createTransactionValidation,
  updateTransactionValidation,
  deleteTransactionValidation,
} = require("./transactionValidation");

module.exports = {
  registerValidation,
  loginValidation,
  createProductValidation,
  updateProductValidation,
  getProductValidation,
  deleteProductValidation,
  getProductsValidation,
  getTransactionsValidation,
  getTransactionValidation,
  createTransactionValidation,
  updateTransactionValidation,
  deleteTransactionValidation,
};
