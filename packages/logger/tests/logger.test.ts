import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createLogger, errorMeta } from "../src";

describe("@paylo/logger", () => {
  beforeEach(() => {
    vi.spyOn(console, "debug").mockImplementation(() => {});
    vi.spyOn(console, "info").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  describe("createLogger", () => {
    it("emits an info line containing timestamp, level, service and message", () => {
      const logger = createLogger({ service: "test-svc", level: "info" });

      logger.info("hello world");

      expect(console.info).toHaveBeenCalledTimes(1);
      const line = vi.mocked(console.info).mock.calls[0]![0] as string;
      expect(line).toMatch(/^\[\d{4}-\d{2}-\d{2}T[\d:.]+Z\] INFO {2}\[test-svc\] hello world$/);
    });

    it("routes each level to the matching console method", () => {
      const logger = createLogger({ service: "svc", level: "debug" });

      logger.debug("d");
      logger.info("i");
      logger.warn("w");
      logger.error("e");

      expect(console.debug).toHaveBeenCalledTimes(1);
      expect(console.info).toHaveBeenCalledTimes(1);
      expect(console.warn).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledTimes(1);
    });

    it("suppresses lines below the configured level", () => {
      const logger = createLogger({ service: "svc", level: "warn" });

      logger.debug("nope");
      logger.info("nope");
      logger.warn("yes");
      logger.error("yes");

      expect(console.debug).not.toHaveBeenCalled();
      expect(console.info).not.toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledTimes(1);
    });

    it("emits nothing at level 'silent'", () => {
      const logger = createLogger({ service: "svc", level: "silent" });

      logger.error("even errors are muted");

      expect(console.error).not.toHaveBeenCalled();
    });

    it("appends meta as JSON at the end of the line", () => {
      const logger = createLogger({ service: "svc", level: "info" });

      logger.info("captured", { token: "abc", amount: 500 });

      const line = vi.mocked(console.info).mock.calls[0]![0] as string;
      expect(line).toContain('{"token":"abc","amount":500}');
    });

    it("defaults to 'silent' when NODE_ENV is test and no LOG_LEVEL set", () => {
      vi.stubEnv("NODE_ENV", "test");
      vi.stubEnv("LOG_LEVEL", "");

      const logger = createLogger({ service: "svc" });

      expect(logger.level).toBe("silent");
    });

    it("honours the LOG_LEVEL env var over the NODE_ENV default", () => {
      vi.stubEnv("NODE_ENV", "test");
      vi.stubEnv("LOG_LEVEL", "debug");

      const logger = createLogger({ service: "svc" });

      expect(logger.level).toBe("debug");
    });

    it("defaults to 'info' outside test when no LOG_LEVEL is set", () => {
      vi.stubEnv("NODE_ENV", "production");
      vi.stubEnv("LOG_LEVEL", "");

      const logger = createLogger({ service: "svc" });

      expect(logger.level).toBe("info");
    });
  });

  describe("child()", () => {
    it("binds context into every line of the child logger", () => {
      const logger = createLogger({ service: "svc", level: "info" });
      const child = logger.child({ requestId: "req-1" });

      child.info("processing");

      const line = vi.mocked(console.info).mock.calls[0]![0] as string;
      expect(line).toContain('"requestId":"req-1"');
    });

    it("merges child context with per-call meta, meta winning on conflict", () => {
      const child = createLogger({ service: "svc", level: "info" }).child({
        a: 1,
        b: "ctx",
      });

      child.info("m", { b: "meta" });

      const line = vi.mocked(console.info).mock.calls[0]![0] as string;
      expect(line).toContain('"a":1');
      expect(line).toContain('"b":"meta"');
    });

    it("inherits the parent's level", () => {
      const child = createLogger({ service: "svc", level: "error" }).child({});

      expect(child.level).toBe("error");
      child.info("suppressed");
      expect(console.info).not.toHaveBeenCalled();
    });
  });

  describe("errorMeta()", () => {
    it("serializes Error instances with name, message and stack", () => {
      const meta = errorMeta(new RangeError("boom"));

      expect(meta.error).toMatchObject({ name: "RangeError", message: "boom" });
      expect((meta.error as { stack?: string }).stack).toBeDefined();
    });

    it("wraps non-Error values as { value }", () => {
      expect(errorMeta("just a string")).toEqual({
        error: { value: "just a string" },
      });
    });
  });
});
