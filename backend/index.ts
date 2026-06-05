import express from "express";
import cors from "cors";
import { Pool } from "pg";

const app = express();
const port = 8080;

app.use(express.json());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
  }),
);

// db pool
const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL || "postgresql://deep:smthn@postgres:5432/k8s-db",
});

app.get("/", (req, res) => {
  res.json({ message: "meow meow" });
});

app.get("/health", (req, res) => {
  res.status(200).json({ health: "ok" });
});

app.get("/todos", async (req, res) => {
  const result = await pool.query("SELECT * FROM todos");
  res.json(result.rows);
});

app.post("/todos", async (req, res) => {
  const { text } = req.body;
  const result = await pool.query(
    "INSERT INTO todos (text) VALUES ($1) RETURNING *",
    [text],
  );
  res.json(result.rows[0]);
});

app.put("/todos/:id", async (req, res) => {
  const id = req.params.id;
  const { text, done } = req.body;

  if (text === undefined && done === undefined) {
    res.status(400).json({ error: "nothing to update" });
    return;
  }

  const result = await pool.query(
    "UPDATE todos SET text = COALESCE($1, text), done = COALESCE($2, done) WHERE id = $3 RETURNING *",
    [text ?? null, done ?? null, id],
  );

  res.json(result.rows[0]);
});

app.delete("/todos/:id", async (req, res) => {
  const id = req.params.id;
  const result = await pool.query(
    "DELETE FROM todos WHERE id = $1 RETURNING *",
    [id],
  );

  res.json(result.rows[0]);
});

// add the db if doesnt exist
async function initDB() {
  while (true) {
    try {
      await pool.query(`CREATE TABLE IF NOT EXISTS todos (
        id SERIAL PRIMARY KEY,
        text TEXT NOT NULL,
        done BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      )`);
      console.log("database initialized");
      break;
    } catch (err: any) {
      console.log("waiting for database...", err.message);
      await new Promise((res) => setTimeout(res, 2000));
    }
  }
}

async function startServer() {
  await initDB();

  app.listen(port, "0.0.0.0", () => {
    console.log(`server running on port -> 8080`);
  });
}

startServer();
