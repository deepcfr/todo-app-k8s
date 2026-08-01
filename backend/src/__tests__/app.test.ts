import { describe, it, expect } from "bun:test";
import request from "supertest";
import { app } from "../index";

describe("app routes", () => {
  it("GET /api return welcome message", async () => {
    const response = await request(app).get("/api");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "meow meow" });
  });

  it("GET /health returns ok", async () => {
    const response = await request(app).get("/api/health");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ health: "ok" });
  });
});
