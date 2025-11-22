"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      "shops",
      [
        {
          name: "Main Store",
          address: "Bole SC W-11 House No. New",
          phone: "+251911234567",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Branch Store - Piazza",
          address: "Piassa, Addis Ababa",
          phone: "+251922345678",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Kaliti-Warehouse",
          address: "Kaliti Industrial Area",
          phone: "+251933456789",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("shops", null, {});
  },
};
