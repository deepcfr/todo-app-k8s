import { generateTodo } from "../generators/todo";
import { pool } from "../lib/db";

const TOTAL_TODOS = 1000;
const BATCH_SIZE = 500; // -> 2 batches

async function seedDB() {
  console.log("-".repeat(5), "Seeding DB", "-".repeat(5));
  const client = await pool.connect(); // -> single client

  try {
    await client.query("BEGIN");
    const todos = Array.from({ length: TOTAL_TODOS }, generateTodo);

    for (let i = 0; i < TOTAL_TODOS; i += BATCH_SIZE) {
      const batch = todos.slice(i, i + BATCH_SIZE);

      // dynamic placeholder
      // ($1, $2), ($3, $4) ...
      const placeholders = batch
        .map((_, index) => {
          const paramCount = index * 2; // -> because we have 2 columns
          return `($${paramCount + 1}, $${paramCount + 2})`;
        })
        .join(",");

      // flatten the todos
      const values = batch.flatMap((todo) => [todo.text, todo.done]);

      await pool.query(
        `INSERT INTO todos (text, done) VALUES ${placeholders}`,
        values,
      );

      await client.query("COMMIT");
      console.log("-".repeat(5), "Done", "-".repeat(5));
    }
  } catch (error) {
    // rollback
    await client.query("ROLLBACK");
    console.error("Error seeding db ", error);
  } finally {
    client.release();
    await pool.end();
  }
}

seedDB();
