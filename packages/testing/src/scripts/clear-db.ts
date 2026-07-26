import { pool } from "../lib/db";

async function clearDB() {
  const client = await pool.connect();
  try {
    await client.query("TRUNCATE TABLE todos RESTART IDENTITY;");
  } catch (e) {
    console.error(e);
  } finally {
    client.release();
    await pool.end();
  }
}

clearDB();
