// this script just checks if HPA works fine under heavy traffic

import http from "k6/http";

export const options = {
  vus: 20,
  duration: "3m",
};

export default function () {
  http.get("http://todo-app.local/api/debug/cpu?BIG_VALUE=100000");
}