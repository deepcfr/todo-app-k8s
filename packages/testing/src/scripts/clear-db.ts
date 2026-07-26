import { pool } from "../lib/db";

async function clearDB() {
  try {
    await pool.query(`TRUNCATE TABLE todos RESTART IDENTITY;`);
  } catch (e) {
    console.error(e);
  }

  await pool.end();
}

clearDB();