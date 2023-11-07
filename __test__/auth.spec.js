const request = require('supertest');
const server = require('../index.js'); // Menggunakan server dari index.js

describe("Auth API", () => {
  it("should register a new user", async () => {
    const newUser = {
      name: "New User",
      email: "newuser@gmail.com",
      password: "password",
      identity_type: "coba",
      identity_account_number: "1234",
      address: "New User Address",
    };

    const response = await request(server)
      .post("/api/v1/auth/register")
      .send(newUser);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("success");
    expect(response.body.data).toBeTruthy();
    expect(Array.isArray(response.body.data)).toBe(false);
  });
  it("should login", async () => {
    const data = {
      email: "newuser@gmail.com",
      password: "password",
    };

    const response = await request(server)
      .post("/api/v1/auth/login")
      .send(data);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("success");
    expect(response.body.data).toBeTruthy();
    expect(Array.isArray(response.body.data)).toBe(false);
  });
});
