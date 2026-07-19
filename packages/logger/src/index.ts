export type LogLevel = "debug" | "info" | "warn" | "error" | "silent";

export interface LoggerOptions {
  /** Name of the app/service emitting the logs, e.g. "bank-webhook" */
  service: string;
  /** Minimum level to emit. Defaults to LOG_LEVEL env, or "silent" in tests, or "info" */
  level?: LogLevel;
  /** Static context merged into every log line */
  context?: Record<string, unknown>;
}

export interface Logger {
  debug(message: string, meta?: Record<string, unknown>): void;
  info(message: string, meta?: Record<string, unknown>): void;
  warn(message: string, meta?: Record<string, unknown>): void;
  error(message: string, meta?: Record<string, unknown>): void;
  /** Returns a new logger with extra context bound to every line */
  child(context: Record<string, unknown>): Logger;
  readonly level: LogLevel;
}

const LEVEL_WEIGHT: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
  silent: 100,
};

const CONSOLE_METHOD: Record<
  Exclude<LogLevel, "silent">,
  "debug" | "info" | "warn" | "error"
> = {
  debug: "debug",
  info: "info",
  warn: "warn",
  error: "error",
};

function defaultLevel(): LogLevel {
  const envLevel = process.env.LOG_LEVEL as LogLevel | undefined;
  if (envLevel && envLevel in LEVEL_WEIGHT) {
    return envLevel;
  }
  if (process.env.NODE_ENV === "test") {
    return "silent";
  }
  return "info";
}

function serializeError(value: unknown): Record<string, unknown> {
  if (value instanceof Error) {
    return { name: value.name, message: value.message, stack: value.stack };
  }
  return { value };
}

function format(
  level: Exclude<LogLevel, "silent">,
  service: string,
  message: string,
  context: Record<string, unknown>,
  meta?: Record<string, unknown>
): string {
  const merged = { ...context, ...meta };
  const line = `[${new Date().toISOString()}] ${level.toUpperCase().padEnd(5)} [${service}] ${message}`;
  if (Object.keys(merged).length === 0) {
    return line;
  }
  return `${line} ${JSON.stringify(merged)}`;
}

export function createLogger(options: LoggerOptions): Logger {
  const level = options.level ?? defaultLevel();
  const context = options.context ?? {};
  const threshold = LEVEL_WEIGHT[level];

  const emit = (
    logLevel: Exclude<LogLevel, "silent">,
    message: string,
    meta?: Record<string, unknown>
  ) => {
    if (LEVEL_WEIGHT[logLevel] < threshold) {
      return;
    }
    // eslint-disable-next-line no-console
    console[CONSOLE_METHOD[logLevel]](
      format(logLevel, options.service, message, context, meta)
    );
  };

  return {
    level,
    debug: (message, meta) => emit("debug", message, meta),
    info: (message, meta) => emit("info", message, meta),
    warn: (message, meta) => emit("warn", message, meta),
    error: (message, meta) => emit("error", message, meta),
    child: (childContext) =>
      createLogger({
        service: options.service,
        level,
        context: { ...context, ...childContext },
      }),
  };
}

/** Helper to attach an unknown caught error to a log line's meta */
export function errorMeta(err: unknown): Record<string, unknown> {
  return { error: serializeError(err) };
}
