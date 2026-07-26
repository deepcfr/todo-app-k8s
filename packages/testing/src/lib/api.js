import http from "k6/http";

const BASE_URL = __ENV.BASE_URL || "http://todo-app.local";

// helper functions
export function getAllTodos() {
  return http.get(`${BASE_URL}/api/todos`);
}

export function getTodo(id) {
  return http.get(`${BASE_URL}/api/todos/${id}`);
}

export function createTodo(text) {
  return http.post(
    `${BASE_URL}/api/todos`,
    JSON.stringify({ text, done: false }),
    {
      headers: { "Content-Type": "application/json" },
    },
  );
}

export function updateTodo(id, fields) {
  return http.put(`${BASE_URL}/api/todos`, JSON.stringify(fields), {
    headers: { "Content-Type": "application/json" },
  });
}

export function deleteTodo(id) {
  return http.del(`${BASE_URL}/api/todos/${id}`);
}
