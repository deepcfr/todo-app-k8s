import http from "k6/http";
import { sleep, check } from "k6";
import { getTodos } from "../lib/api.js";

export const options = {
  stages: [
    { duration: "10s", target: 50 },
    { duration: "20s", target: 50 },
    { duration: "10s", target: 0 },
  ],
  thresholds: {
    http_req_duration: ["p(95)<300"],
    http_req_failed: ["rate<0.01"],
  },
};

export default function () {
  const res = getTodos()

  check(res, {
    "status is 200": (r) => r.status === 200,
  });

  sleep(1);
}
