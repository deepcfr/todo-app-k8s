export type LogLevel = "info" | "warn" | "error"; // 3 log types

type LogContext = Record<string, unknown>; // additional context

const colors = {
  reset: "\x1b[0m",
  info: "\x1b[36m", // cyan
  warn: "\x1b[33m", // yellow
  error: "\x1b[31m", // red
};

function writeLog(level: LogLevel, message: string, context?: LogContext) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...context,
  };

  const color = colors[level];

  console.log(
    `${color}[${level.toUpperCase()}]${colors.reset} ${JSON.stringify(entry)}`
  );
}

export const logger = {
  info(message: string, context?: LogContext) {
    writeLog("info", message, context);
  },

  warn(message: string, context?: LogContext) {
    writeLog("warn", message, context);
  },

  error(message: string, context?: LogContext) {
    writeLog("error", message, context);
  },
};
