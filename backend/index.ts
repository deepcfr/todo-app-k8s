import express from "express";
import cors from "cors";
import { Pool } from "pg";

const app = express();
const port = 8080;

app.use(express.json());
app.use(cors());

// db pool
const pool = new Pool({
  connectionString: "postgresql://deep:smthn@localhost:5432/k8s-db",
});

app.get("/", (req, res) => {
  res.json({ health: "ok" });
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

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// add the db if doesnt exist
async function initDB() {
  await pool.query(`CREATE TABLE IF NOT EXISTS todos (
        id SERIAL PRIMARY KEY,
        text TEXT NOT NULL,
        done BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
    )`);
}

initDB();
