import { beforeAll, afterEach, afterAll } from "bun:test";
import { pool } from "../index";

process.env.DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://deep:smthn@localhost:5432/todo-test-db";

beforeAll(async () => {
  await pool.query(`CREATE TABLE IF NOT EXISTS todos (
    id SERIAL PRIMARY KEY,
    text TEXT NOT NULL,
    done BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
  )`);
});

// clear junk
afterEach(async () => {
  await pool.query("TRUNCATE TABLE todos RESTART IDENTITY");
});

afterAll(async () => {
  await pool.end();
});
