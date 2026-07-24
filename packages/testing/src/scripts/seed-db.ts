import { pool } from "../db";
import { generateTodo } from "../generators/todo";

// seed 1000 todos
async function seedDB() {
  console.log("seeding db...");

  for (let i = 1; i <= 20; i++) {
    const todo = generateTodo();

    try {
      await pool.query(
        `
            INSERT INTO todos(text, done)
            VALUES($1, $2)
            `,
        [todo.text, todo.done],
      );
    } catch (e) {
      console.error(e);
    }

    // print on every *00 todos inserted
    if (i % 100 === 0) {
      console.log(`${i} todos inserted.`);
    }
  }

  console.log("Done");

  await pool.end();
}

seedDB();
