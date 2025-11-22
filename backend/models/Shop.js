const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Shop = sequelize.define(
    "Shop",
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
      address: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: "shops",
    }
  );

  return Shop;
};
