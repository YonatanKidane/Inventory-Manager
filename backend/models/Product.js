const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Product = sequelize.define(
    "Product",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      lowStockThreshold: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 10,
      },
      category: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      shopId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "shops",
          key: "id",
        },
      },
    },
    {
      tableName: "products",
    }
  );

  Product.associate = (models) => {
    Product.belongsTo(models.Shop, { foreignKey: "shopId" });
    Product.hasMany(models.Transaction, { foreignKey: "productId" });
  };

  return Product;
};
