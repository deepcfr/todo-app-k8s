import http from "k6/http";
import { sleep } from "k6";

const BASE_URL = __ENV.BASE_URL || "http://localhost:8080";

export const options = {
  stages: [
    { duration: "30s", target: 5 },
    { duration: "30s", target: 50 },
    { duration: "1m", target: 50 },
    { duration: "30s", target: 200 },
    { duration: "1m", target: 200 },
    { duration: "30s", target: 0 },
  ],
};

export default function () {
  http.get(`${BASE_URL}/api/todos`);

  const payload = JSON.stringify({
    text: `load test todo ${__VU}-${__ITER}`,
  });

  http.post(`${BASE_URL}/api/todos`, payload, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  sleep(1);
}

// clear all todos after testing is done
export function teardown() {
  http.del(`${BASE_URL}/api/todos`);
}
