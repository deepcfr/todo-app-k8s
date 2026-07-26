import { check } from "k6";
import { createTodo, getTodo, updateTodo } from "./api.js";

export function runFullLifecycle() {
  const createRes = createTodo(`todo-${__VU}-${__ITER}`);
//   console.log(`status: ${createRes.status}, body: ${createRes.body}`);
  const createOk = check(createRes, {
    "create status is 201": (r) => r.status === 201,
  });
  if (!createOk) return;

  const id = createRes.json("id");

  const getRes = getTodo(id);
  check(getRes, {
    "get status is 200": (r) => r.status === 200,
  });

  const updateRes = updateTodo(id, { done: true });
  check(updateRes, {
    "update status is 200": (r) => r.status === 200,
  });

  const deleteRes = deleteTodo(id);
  check(deleteRes, {
    "delete status is 200 or 204": (r) => r.status === 200 || r.status === 204,
  });
}
