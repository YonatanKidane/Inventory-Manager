const db = require("../models");
const { validationResult } = require("express-validator");

const getProducts = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { page = 1, limit = 10, category, lowStock } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = {};
    if (category) {
      whereClause.category = category;
    }
    if (lowStock === "true") {
      whereClause.quantity = {
        [db.Sequelize.Op.lte]: db.Sequelize.col("lowStockThreshold"),
      };
    }

    const { count, rows: products } = await db.Product.findAndCountAll({
      where: whereClause,
      include: [{ model: db.Shop, attributes: ["name"] }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["createdAt", "DESC"]],
    });

    res.json({
      products,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const product = await db.Product.findByPk(req.params.id, {
      include: [
        { model: db.Shop, attributes: ["name"] },
        {
          model: db.Transaction,
          include: [{ model: db.User, attributes: ["username"] }],
        },
      ],
    });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    console.error("Get product error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const createProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const product = await db.Product.create(req.body);
    await db.Transaction.create({
      type: "in",
      quantity: req.body.quantity,
      reason: "Initial stock",
      productId: product.id,
      userId: req.user.id,
    });
    res.status(201).json(product);
  } catch (error) {
    console.error("Create product error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const product = await db.Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const oldQuantity = product.quantity;
    await product.update(req.body);

    if (req.body.quantity !== undefined && req.body.quantity !== oldQuantity) {
      const type = req.body.quantity > oldQuantity ? "in" : "out";
      const quantity = Math.abs(req.body.quantity - oldQuantity);
      await db.Transaction.create({
        type,
        quantity,
        reason: "Stock adjustment",
        productId: product.id,
        userId: req.user.id,
      });
    }

    res.json(product);
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const product = await db.Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    await product.destroy();
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const { Op, where, literal } = require("sequelize");

const getLowStockAlerts = async (req, res) => {
  try {
    const lowStockProducts = await db.sequelize.query(
      `SELECT p.*, s.name AS "shopName" 
       FROM products p
       LEFT JOIN shops s ON p."shopId" = s.id
       WHERE p.quantity <= p."lowStockThreshold"`,
      { type: db.sequelize.QueryTypes.SELECT }
    );
    res.json(lowStockProducts);
  } catch (error) {
    console.error("Get low stock alerts error:", error.stack || error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message || error.toString(),
      stack: error.stack || null,
    });
  }
};

const getTotalQuantity = async (req, res) => {
  try {
    // Query to get total quantity by category from products table directly, summing quantities by category
    const totalResult = await db.sequelize.query(
      "SELECT category, COALESCE(SUM(quantity), 0) as totalQuantity " +
        "FROM products GROUP BY category",
      { type: db.sequelize.QueryTypes.SELECT }
    );
    /*
      totalResult example:
      [
        { category: "Electronics", totalQuantity: 50 },
        { category: "Clothing", totalQuantity: 30 },
        ...
      ]
    */
    // Convert totalQuantity from string to number if necessary
    // Log totalResult to debug keys
    console.log("Total Quantity Query Result:", totalResult);
    if (totalResult.length > 0) {
      console.log("Keys in first row:", Object.keys(totalResult[0]));
      for (const [key, value] of Object.entries(totalResult[0])) {
        console.log(`Key: ${key}, Value: ${value}, Type: ${typeof value}`);
      }
    }
    const sanitizedResult = totalResult.map((item) => ({
      category: item.category ? item.category.trim() : item.category,
      totalQuantity:
        item.totalquantity !== null ? Number(item.totalquantity) : 0,
    }));

    res.json({ categoryTotals: sanitizedResult });
  } catch (error) {
    console.error("Get total quantity error:", error.stack || error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message || error.toString(),
      stack: error.stack || null,
    });
  }
};

const seedProducts = async (req, res) => {
  try {
    const products = [
      {
        name: "Sample Product 1",
        description: "Description for product 1",
        price: 100.0,
        quantity: 20,
        lowStockThreshold: 5,
        category: "Electronics",
        shopId: 1,
      },
      {
        name: "Sample Product 2",
        description: "Description for product 2",
        price: 50.0,
        quantity: 15,
        lowStockThreshold: 5,
        category: "Household",
        shopId: 1,
      },
    ];

    const existingProducts = await db.Product.findAll({
      where: {
        name: {
          [db.Sequelize.Op.in]: products.map((p) => p.name),
        },
      },
    });

    if (existingProducts.length > 0) {
      return res.status(400).json({ message: "Products already exist" });
    }

    const createdProducts = await db.Product.bulkCreate(products);

    for (const product of createdProducts) {
      await db.Transaction.create({
        type: "in",
        quantity: product.quantity,
        reason: "Initial stock from seeding",
        productId: product.id,
        userId: req.user.id,
      });
    }

    res.status(201).json({
      message: "Products seeded successfully",
      products: createdProducts,
    });
  } catch (error) {
    console.error("Seed products error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getLowStockAlerts,
  getTotalQuantity,
  seedProducts,
};
