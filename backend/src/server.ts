import { app, pool } from "./index";
import { logger } from "./logger";

const PORT = parseInt(process.env.PORT as string) || 8080;

// add the db if doesnt exist
async function initDB() {
  while (true) {
    try {
      await pool.query(`CREATE TABLE IF NOT EXISTS todos (
        id SERIAL PRIMARY KEY,
        text TEXT NOT NULL,
        done BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )`);
      console.log("database initialized");
      break;
    } catch (error) {
      logger.warn("Waiting for database", {
        event: "database_unavailable",
        error: error instanceof Error ? error.message : String(error),
      });

      await new Promise(res => setTimeout(res, 2000));
    }
  }
}

logger.info("Starting backend", {
  event: "server_starting",
  port: PORT,
});

async function startServer() {
  await initDB();

  logger.info("Database initialized", {
    event: "database_initialized",
  });

  app.listen(PORT, "0.0.0.0", () => {
    logger.info("Server listening", {
      event: "server_listening",
      host: "0.0.0.0",
      port: PORT,
    });
  });
}

startServer();
