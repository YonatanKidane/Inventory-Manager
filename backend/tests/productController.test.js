const request = require("supertest");
const app = require("../server"); // Assuming app is exported from server.js
const db = require("../models");

describe("Product Controller API Tests", () => {
  let token = "";

  beforeAll(async () => {
    // Wait for database connection to be established before tests
    await db.sequelize.authenticate();
    await db.sequelize.sync();

    // Use provided admin token directly
    token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwidXNlcm5hbWUiOiJhZG1pbiIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2MzgwOTk1NywiZXhwIjoxNzYzODk2MzU3fQ.7n0vxksXvNjdI2x4d4Vs-NHSNMOwSCQJuOCLNI29mxw";
  });

  afterAll(async () => {
    await db.sequelize.close();
  });

  test("GET /api/products/total-quantity should return category totals", async () => {
    const res = await request(app)
      .get("/api/products/total-quantity")
      .set("Authorization", `Bearer ${token}`)
      .expect("Content-Type", /json/)
      .expect(200);

    expect(res.body).toHaveProperty("categoryTotals");
    expect(Array.isArray(res.body.categoryTotals)).toBe(true);
    if (res.body.categoryTotals.length > 0) {
      expect(res.body.categoryTotals[0]).toHaveProperty("category");
      expect(res.body.categoryTotals[0]).toHaveProperty("totalQuantity");
    }
  });

  test("Unauthorized request to /api/products/total-quantity should fail", async () => {
    await request(app).get("/api/products/total-quantity").expect(401);
  });
});
