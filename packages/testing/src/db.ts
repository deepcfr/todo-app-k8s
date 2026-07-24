import { Pool } from "pg";

export const pool = new Pool({
  connectionString: "postgresql://deep:smthn@localhost:5432/todo-db",
});
