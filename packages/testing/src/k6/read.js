import http from "k6/http";
import { sleep, check } from "k6";

export const options = {
  vus: 50,
  duration: "30s",
};

export default function () {
  const res = http.get("http://todo-app.local/api/todos");

  check(res, {
    "status is 200": (r) => r.status === 200,
  });

  sleep(1);
}
