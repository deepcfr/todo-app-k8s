import express from "express";
import cors from "cors";
import { Pool } from "pg";
import { metricsMiddleware } from "./middlewares/metrics.middleware";
import { metricsRegistry, todoCreatedTotal, todoDeletedTotal } from "./metrics";
import { requestLogger } from "./middlewares/requestLogger.middleware";
import { logger } from "./logger";

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);
app.use(metricsMiddleware);
app.use(requestLogger);
app.use(express.json());

// db pool
const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL || "postgresql://deep:smthn@postgres:5432/todo-db",
});

// collect metrics
app.get("/metrics", async (req, res) => {
  res.setHeader("Content-Type", metricsRegistry.contentType);
  res.end(await metricsRegistry.metrics());
});

const apiRouter = express.Router();

// cpu stress endpoint
apiRouter.get("/debug/cpu", (req, res) => {
  const BIG_VALUE = Number(req.query.BIG_VALUE as string);

  if (Number.isNaN(BIG_VALUE) || BIG_VALUE <= 0) {
    return res.status(400).json({
      error: "BIG_VALUE must be a positive integer",
    });
  }

  let sum = 0;

  for (let i = 1; i < BIG_VALUE; ++i) {
    sum += i;
  }

  res.json({
    sum,
  });
});

apiRouter.get("/", (req, res) => {
  res.json({ message: "meow meow" });
});

apiRouter.get("/health", (req, res) => {
  res.status(200).json({ health: "ok" });
});

apiRouter.get("/todos", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM todos");
    res.json(result.rows);
  } catch (error) {
    logger.error("Failed to fetch todos", {
      event: "todo_fetch_failed",
      method: req.method,
      path: req.path,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    res.status(500).json({ error: "internal server error" });
  }
});

// get todos by id
apiRouter.get("/todos/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const result = await pool.query("SELECT * FROM todos WHERE id = $1", [id]);
    if (result.rows.length === 0)
      return res.status(404).json({ message: "todo not found" });
    res.status(200).json(result.rows[0]);
  } catch (error) {
    logger.error("Failed to fetch todo", {
      event: "todo_fetch_by_id_failed",
      method: req.method,
      path: req.path,
      todo_id: req.params.id,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    res.status(500).json({ error: "internal server error" });
  }
});

apiRouter.post("/todos", async (req, res) => {
  try {
    const { text } = req.body;

    if (typeof text !== "string" || text.trim().length === 0) {
      return res.status(400).json({ error: "text is required" });
    }

    const result = await pool.query(
      "INSERT INTO todos (text) VALUES ($1) RETURNING *",
      [text]
    );

    todoCreatedTotal.inc();
    res.status(201).json(result.rows[0]);
  } catch (error) {
    logger.error("Failed to create todo", {
      event: "todo_create_failed",
      method: req.method,
      path: req.path,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    res.status(500).json({ error: "internal server error" });
  }
});

apiRouter.put("/todos/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const { text, done } = req.body;

    if (text === undefined && done === undefined) {
      return res.status(400).json({ error: "nothing to update" });
    }

    if (
      text !== undefined &&
      (typeof text !== "string" || text.trim().length === 0)
    ) {
      return res.status(400).json({ error: "text cannot be empty" });
    }

    const result = await pool.query(
      "UPDATE todos SET text = COALESCE($1, text), done = COALESCE($2, done) WHERE id = $3 RETURNING *",
      [text ?? null, done ?? null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "todo not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    logger.error("Failed to update todo", {
      event: "todo_update_failed",
      method: req.method,
      path: req.path,
      todo_id: req.params.id,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    res.status(500).json({ error: "internal server error" });
  }
});

// bulk delete todos after testing
apiRouter.delete("/todos", async (req, res) => {
  try {
    const result = await pool.query("DELETE FROM todos RETURNING *");
    const deletedCount = result.rowCount ?? 0;

    if (deletedCount > 0) {
      todoDeletedTotal.inc(deletedCount);
    }

    res.json({ deletedCount, todos: result.rows });
  } catch (error) {
    logger.error("Failed to delete all todos", {
      event: "todo_delete_all_failed",
      method: req.method,
      path: req.path,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    res.status(500).json({ error: "internal server error" });
  }
});

apiRouter.delete("/todos/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const result = await pool.query(
      "DELETE FROM todos WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "todo not found" });
    }

    todoDeletedTotal.inc();
    res.json(result.rows[0]);
  } catch (error) {
    logger.error("Failed to delete todo", {
      event: "todo_delete_failed",
      method: req.method,
      path: req.path,
      todo_id: req.params.id,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    res.status(500).json({ error: "internal server error" });
  }
});

app.use("/api", apiRouter);

export { app, pool };
