import { describe, it, expect } from "bun:test";
import request from "supertest";
import { app } from "../index";

describe("todo routes", () => {
  it("GET /api/todos returns an empty list initially", async () => {
    const response = await request(app).get("/api/todos");
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it("creates and fetches a todo", async () => {
    const createResponse = await request(app)
      .post("/api/todos")
      .send({ text: "write todo tests" });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.text).toBe("write todo tests");
    expect(createResponse.body.done).toBe(false);

    const getResponse = await request(app).get(
      `/api/todos/${createResponse.body.id}`
    );
    expect(getResponse.status).toBe(200);
    expect(getResponse.body.id).toBe(createResponse.body.id);
  });

  it("rejects creating a todo with empty text", async () => {
    const response = await request(app).post("/api/todos").send({ text: "" });
    expect(response.status).toBe(400);
  });

  it("returns 404 for a nonexistent todo", async () => {
    const response = await request(app).get("/api/todos/999999");
    expect(response.status).toBe(404);
  });

  it("updates and deletes a todo", async () => {
    const created = await request(app)
      .post("/api/todos")
      .send({ text: "old text" });

    const updateResponse = await request(app)
      .put(`/api/todos/${created.body.id}`)
      .send({ text: "new text", done: true });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.text).toBe("new text");
    expect(updateResponse.body.done).toBe(true);

    const deleteResponse = await request(app).delete(
      `/api/todos/${created.body.id}`
    );
    expect(deleteResponse.status).toBe(200);

    const getResponse = await request(app).get(`/api/todos/${created.body.id}`);
    expect(getResponse.status).toBe(404);
  });

  it("rejects update with nothing to update", async () => {
    const created = await request(app).post("/api/todos").send({ text: "x" });
    const response = await request(app)
      .put(`/api/todos/${created.body.id}`)
      .send({});
    expect(response.status).toBe(400);
  });

  it("rejects update with empty text", async () => {
    const created = await request(app).post("/api/todos").send({ text: "x" });
    const response = await request(app)
      .put(`/api/todos/${created.body.id}`)
      .send({ text: "" });
    expect(response.status).toBe(400);
  });
});
