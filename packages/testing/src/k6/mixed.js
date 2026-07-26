import { runFullLifecycle } from "../lib/lifecycle.js";
import { sleep } from "k6";

export const options = {
  stages: [
    { duration: "10s", target: 20 },
    { duration: "30s", target: 20 },
    { duration: "10s", target: 0 },
  ],
  thresholds: {
    http_req_duration: ["p(95)<400"],
    http_req_failed: ["rate<0.01"],
  },
};

export default function () {
  runFullLifecycle();
  sleep(1);
}
