const express = require("express");
const cors = require("cors");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
require("dotenv").config();

const db = require("./models");

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Inventory Management API",
    version: "1.0.0",
    description: "API for managing inventory",
  },
  servers: [
    {
      url: "http://localhost:5000",
      description: "Development server",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      User: {
        type: "object",
        properties: {
          id: {
            type: "integer",
            description: "User ID",
          },
          username: {
            type: "string",
            description: "Username",
          },
          email: {
            type: "string",
            format: "email",
            description: "Email address",
          },
          role: {
            type: "string",
            enum: ["admin", "manager", "staff"],
            description: "User role",
          },
        },
      },
      Product: {
        type: "object",
        properties: {
          id: {
            type: "integer",
            description: "Product ID",
          },
          name: {
            type: "string",
            description: "Product name",
          },
          description: {
            type: "string",
            description: "Product description",
          },
          price: {
            type: "number",
            description: "Product price",
          },
          quantity: {
            type: "integer",
            description: "Product quantity",
          },
          lowStockThreshold: {
            type: "integer",
            description: "Low stock threshold",
          },
          category: {
            type: "string",
            description: "Product category",
          },
          shopId: {
            type: "integer",
            description: "Shop ID",
          },
        },
      },
      Transaction: {
        type: "object",
        properties: {
          id: {
            type: "integer",
            description: "Transaction ID",
          },
          type: {
            type: "string",
            enum: ["in", "out"],
            description: "Transaction type",
          },
          quantity: {
            type: "integer",
            description: "Transaction quantity",
          },
          reason: {
            type: "string",
            description: "Transaction reason",
          },
          productId: {
            type: "integer",
            description: "Product ID",
          },
          createdAt: {
            type: "string",
            format: "date-time",
            description: "Creation timestamp",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
            description: "Update timestamp",
          },
        },
      },
      Error: {
        type: "object",
        properties: {
          message: {
            type: "string",
            description: "Error message",
          },
        },
      },
      ValidationError: {
        type: "object",
        properties: {
          errors: {
            type: "array",
            items: {
              type: "object",
              properties: {
                msg: {
                  type: "string",
                  description: "Validation error message",
                },
                param: {
                  type: "string",
                  description: "Parameter name",
                },
                location: {
                  type: "string",
                  description: "Location of the error",
                },
              },
            },
          },
        },
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ["./routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/auth", require("./routes/auth"));
app.use("/api/products", require("./routes/products"));
app.use("/api/transactions", require("./routes/transactions"));

app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT || 5000;

db.sequelize
  .sync()
  .then(() => {
    console.log("Database synced successfully");
    if (process.env.NODE_ENV !== "test") {
      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
        console.log(
          `Swagger docs available at http://localhost:${PORT}/api-docs`
        );
      });
    }
  })
  .catch((err) => {
    console.error("Unable to sync database:", err);
  });

module.exports = app;
