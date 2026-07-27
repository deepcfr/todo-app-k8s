import express from "express";
import cors from "cors";
import { Pool } from "pg";
import { metricsMiddleware } from "./middlewares/metrics.middleware";
import { metricsRegistry, todoCreatedTotal, todoDeletedTotal } from "./metrics";
import { requestLogger } from "./middlewares/requestLogger.middleware";

const app = express();
const port = 8080;

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
  }),
);
app.use(metricsMiddleware);
app.use(requestLogger);
app.use(express.json());

// db pool
const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://deep:smthn@localhost:5432/todo-db",
});

// collect metrics
app.get("/metrics", async (req, res) => {
  res.setHeader("Content-Type", metricsRegistry.contentType);
  res.end(await metricsRegistry.metrics());
});

const apiRouter = express.Router();

apiRouter.get("/", (req, res) => {
  res.json({ message: "meow meow" });
});

apiRouter.get("/health", (req, res) => {
  res.status(200).json({ health: "ok" });
});

apiRouter.get("/todos", async (req, res) => {
  const result = await pool.query("SELECT * FROM todos");
  res.json(result.rows);
});

// get todos by id
apiRouter.get("/todos/:id", async (req, res) => {
  const id = req.params.id;
  const result = await pool.query("SELECT * FROM todos WHERE id = $1", [id]);
  if (!result) return res.status(404).json({ message: "todo not found" });
  return res.status(200).json(result.rows[0]);
});

apiRouter.post("/todos", async (req, res) => {
  const { text } = req.body;
  const result = await pool.query(
    "INSERT INTO todos (text) VALUES ($1) RETURNING *",
    [text],
  );

  todoCreatedTotal.inc();

  res.status(201).json(result.rows[0]);
});

apiRouter.put("/todos/:id", async (req, res) => {
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

// bulk delete todos after testing
apiRouter.delete("/todos", async (req, res) => {
  const result = await pool.query("DELETE FROM todos RETURNING *");
  const deletedCount = result.rowCount ?? 0;

  if (deletedCount > 0) {
    todoDeletedTotal.inc(deletedCount);
  }

  res.json({ deletedCount, todos: result.rows });
});

apiRouter.delete("/todos/:id", async (req, res) => {
  const id = req.params.id;
  const result = await pool.query(
    "DELETE FROM todos WHERE id = $1 RETURNING *",
    [id],
  );

  todoDeletedTotal.inc();

  res.json(result.rows[0]);
});

app.use("/api", apiRouter);

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

// debug
console.log("starting..");
console.log(process.env.DATABASE_URL);

async function startServer() {
  await initDB();

  console.log("DB up..");

  app.listen(port, "0.0.0.0", () => {
    console.log(`server running on port -> 8080`);
  });
}

startServer();
