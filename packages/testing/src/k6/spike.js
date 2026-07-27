/**
 traffic suddenly jumps. it checks if the system recovers successfully
 after a sudden jump or not.
 */
import { runFullLifecycle } from "./lib/lifecycle.js";
import { sleep } from "k6";

export const options = {
  stages: [
    { duration: "30s", target: 10 },
    { duration: "10s", target: 300 },
    { duration: "1m", target: 300 },
    { duration: "10s", target: 10 },
    { duration: "2m", target: 10 },
  ],
  thresholds: {
    http_req_duration: ["p(95)<1000"],
    http_req_failed: ["rate<0.1"],
  },
};

export default function () {
  runFullLifecycle();
  sleep(0.5);
}
