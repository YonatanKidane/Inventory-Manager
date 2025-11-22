const db = require("../models");
const { validationResult } = require("express-validator");

const getTransactions = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { page = 1, limit = 10, productId, type } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = {};
    if (productId) {
      whereClause.productId = productId;
    }
    if (type) {
      whereClause.type = type;
    }

    const { count, rows: transactions } = await db.Transaction.findAndCountAll({
      where: whereClause,
      include: [
        { model: db.Product, attributes: ["name", "description", "price"] },
        { model: db.User, attributes: ["username"] },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["createdAt", "DESC"]],
    });

    const totalResult = await db.sequelize.query(
      'SELECT SUM(t.quantity * p.price) as total FROM transactions t JOIN products p ON t."productId" = p.id',
      { type: db.sequelize.QueryTypes.SELECT }
    );
    const totalValue = totalResult[0].total || 0;

    res.json({
      transactions,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit),
        limit: parseInt(limit),
      },
      totalValue,
    });
  } catch (error) {
    console.error("Get transactions error:", error.message || error);
    console.error(error.stack || "");
    res.status(500).json({
      message: "Internal server error",
      error: error.message || error.toString(),
      stack: error.stack || null,
    });
  }
};

const getTransaction = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const transaction = await db.Transaction.findByPk(req.params.id, {
      include: [
        { model: db.Product, attributes: ["name", "description"] },
        { model: db.User, attributes: ["username"] },
      ],
    });
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }
    res.json(transaction);
  } catch (error) {
    console.error("Get transaction error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const createTransaction = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let { type, quantity, reason, productId } = req.body;
    quantity = Number(quantity); 

    const product = await db.Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (type === "in") {
      product.quantity += quantity;
    } else if (type === "out") {
      if (product.quantity < quantity) {
        return res.status(400).json({ message: "Insufficient stock" });
      }
      product.quantity -= quantity;
    }
    await product.save();

    const transaction = await db.Transaction.create({
      type,
      quantity,
      reason,
      productId,
      userId: req.user.id,
    });

    res.status(201).json(transaction);
  } catch (error) {
    console.error("Create transaction error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateTransaction = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const transaction = await db.Transaction.findByPk(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    let { type, quantity, reason, productId } = req.body;
    quantity = Number(quantity); 

    if (productId && productId !== transaction.productId) {
      const product = await db.Product.findByPk(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
    }

    const oldProduct = await db.Product.findByPk(transaction.productId);
    if (transaction.type === "in") {
      oldProduct.quantity -= transaction.quantity;
    } else if (transaction.type === "out") {
      oldProduct.quantity += transaction.quantity;
    }
    await oldProduct.save();

    const newProduct = productId
      ? await db.Product.findByPk(productId)
      : oldProduct;
    if (type === "in") {
      newProduct.quantity += quantity;
    } else if (type === "out") {
      if (newProduct.quantity < quantity) {
        return res.status(400).json({ message: "Insufficient stock" });
      }
      newProduct.quantity -= quantity;
    }
    await newProduct.save();

    await transaction.update({ type, quantity, reason, productId });

    res.json(transaction);
  } catch (error) {
    console.error("Update transaction error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteTransaction = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const transaction = await db.Transaction.findByPk(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    const product = await db.Product.findByPk(transaction.productId);
    if (transaction.type === "in") {
      product.quantity -= transaction.quantity;
    } else if (transaction.type === "out") {
      product.quantity += transaction.quantity;
    }
    await product.save();

    await transaction.destroy();

    res.json({ message: "Transaction deleted successfully" });
  } catch (error) {
    console.error("Delete transaction error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getTotalTransactionValue = async (req, res) => {
  try {
    const totalResult = await db.sequelize.query(
      'SELECT COALESCE(SUM(t.quantity * p.price), 0) as total FROM transactions t JOIN products p ON t."productId" = p.id',
      { type: db.sequelize.QueryTypes.SELECT }
    );
    const totalValue = totalResult[0].total || 0;
    res.json({ totalValue });
  } catch (error) {
    console.error("Get total transaction value error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTotalTransactionValue,
};
