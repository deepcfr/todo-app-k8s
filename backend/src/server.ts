import { app, pool } from "./index";

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

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`server running on port -> 8080`);
  });
}

startServer();
