const request = require("supertest");
const app = require("../server");
const db = require("../models");

let token; // placeholder for auth token

beforeAll(async () => {
  // Sync db and get auth token for admin user
  await db.sequelize.sync({ force: true });

  // Seed admin user - assuming seeder or create here manually
  await db.User.create({
    username: "admin",
    email: "admin@example.com",
    password: "password",
    role: "admin",
  });

  // Login to get token - adapt as needed based on auth route
  const res = await request(app)
    .post("/api/auth/login")
    .send({ email: "admin@example.com", password: "password" });
  token = res.body.token;
});

afterAll(async () => {
  await db.sequelize.close();
});

describe("Product Controller API Detailed Tests", () => {
  test("GET /api/products/total-quantity should return 0 initially", async () => {
    const res = await request(app)
      .get("/api/products/total-quantity")
      .set("Authorization", `Bearer ${token}`)
      .expect("Content-Type", /json/)
      .expect(200);

    expect(res.body).toHaveProperty("totalQuantity");
    expect(res.body.totalQuantity).toBe(0);
  });

  test("Create products and test total quantity aggregation", async () => {
    const product1 = await db.Product.create({
      name: "Product 1",
      description: "Desc 1",
      price: 10,
      quantity: 5,
      category: "Electronics",
      lowStockThreshold: 2,
      shopId: 1,
    });
    const product2 = await db.Product.create({
      name: "Product 2",
      description: "Desc 2",
      price: 20,
      quantity: 3,
      category: "Electronics",
      lowStockThreshold: 1,
      shopId: 1,
    });

    const res = await request(app)
      .get("/api/products/total-quantity")
      .set("Authorization", `Bearer ${token}`)
      .expect("Content-Type", /json/)
      .expect(200);

    expect(res.body).toHaveProperty("totalQuantity");
    expect(res.body.totalQuantity).toBe(8);
  });

  test("GET /api/products without token should fail", async () => {
    await request(app).get("/api/products/total-quantity").expect(401);
  });

  // Additional tests for other product endpoints can be added similarly
});
