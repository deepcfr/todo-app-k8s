const verbs = [
  "Buy",
  "Review",
  "Implement",
  "Deploy",
  "Fix",
  "Update",
  "Refactor",
  "Write",
  "Optimize",
  "Monitor",
];

const objects = [
  "Redis cache",
  "Kubernetes dashboard",
  "Grafana alerts",
  "PostgreSQL metrics",
  "CI pipeline",
  "Docker image",
  "API documentation",
  "JWT authentication",
  "Helm chart",
  "Load tests",
];

// generate todos
export function generateTodo() {
  const verb = verbs[Math.floor(Math.random() * verbs.length)];
  const object = objects[Math.floor(Math.random() * objects.length)];

  return {
    text: `${verb} ${object}`,
    done: Math.random() < 0.3,
  };
}
