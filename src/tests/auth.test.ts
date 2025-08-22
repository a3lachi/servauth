import { describe, expect, test, beforeAll, afterAll } from "bun:test";
import app from "../index";

const baseURL = "http://localhost:3000";
let testUser = {
  email: `test${Date.now()}@example.com`,
  password: "testPassword123!",
  name: "Test User"
};
let authToken: string;

describe("Authentication API", () => {
  test("POST /auth/register - should register a new user", async () => {
    const response = await app.fetch(
      new Request(`${baseURL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testUser),
      })
    );

    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.message).toBe("Registration successful");
    expect(data.user.email).toBe(testUser.email);
  });

  test("POST /auth/login - should login user", async () => {
    const response = await app.fetch(
      new Request(`${baseURL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: testUser.email,
          password: testUser.password,
        }),
      })
    );

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.message).toBe("Login successful");
    expect(data.user.email).toBe(testUser.email);
    
    // Extract session cookie
    const setCookie = response.headers.get("set-cookie");
    if (setCookie) {
      authToken = setCookie.split(";")[0].split("=")[1];
    }
  });

  test("GET /auth/me - should get current user", async () => {
    const response = await app.fetch(
      new Request(`${baseURL}/auth/me`, {
        method: "GET",
        headers: {
          Cookie: `auth-session=${authToken}`,
        },
      })
    );

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.user.email).toBe(testUser.email);
  });

  test("PUT /auth/me - should update user", async () => {
    const response = await app.fetch(
      new Request(`${baseURL}/auth/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Cookie: `auth-session=${authToken}`,
        },
        body: JSON.stringify({
          name: "Updated Name",
        }),
      })
    );

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.user.name).toBe("Updated Name");
  });

  test("POST /auth/logout - should logout user", async () => {
    const response = await app.fetch(
      new Request(`${baseURL}/auth/logout`, {
        method: "POST",
        headers: {
          Cookie: `auth-session=${authToken}`,
        },
      })
    );

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.message).toBe("Logout successful");
  });
});