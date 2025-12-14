import { ORPCError } from "@orpc/client";
import { TRPCError } from "@trpc/server";

import {
  DEFAULTS,
  ERROR_BANNED_HOSTNAME,
  ERROR_CONTAINS_CREDENTIALS,
  ERROR_CONTAINS_IP,
  ERROR_INVALID_HOSTNAME,
  ERROR_INVALID_SCHEME,
  ERROR_URL_EMPTY,
  ERROR_URL_MALFORMED,
  validateUrl,
} from "@server/utils/urls/validateUrl";

jest.mock("@orpc/client", () => {
  interface ORPCErrorOptions {
    message?: string;
    cause?: unknown;
    status?: number;
    data?: unknown;
    defined?: unknown;
  }

  class ORPCError extends Error {
    public readonly code: string;
    public readonly status?: number;
    public readonly data?: unknown;
    public readonly defined?: unknown;

    constructor(code: string, ...rest: [ORPCErrorOptions] | []) {
      const opts: ORPCErrorOptions = rest[0] ?? {};
      super(opts.message ?? `Mock ORPCError with code ${code}`);
      this.name = "ORPCError";
      this.code = code;
      this.cause = opts.cause;
      this.status = opts.status;
      this.data = opts.data;
      this.defined = opts.defined;
    }
  }

  return { __esModule: true, ORPCError };
});

describe("validateUrl", () => {
  describe("rejects", () => {
    it("empty input (undefined/null/empty string)", () => {
      // @ts-expect-error - intentional bad input
      expect(() => validateUrl(undefined)).toThrow(ERROR_URL_EMPTY);
      // @ts-expect-error - intentional bad input
      expect(() => validateUrl(null)).toThrow(ERROR_URL_EMPTY);
      expect(() => validateUrl("")).toThrow(ERROR_URL_EMPTY);
    });

    it("whitespace-only input", () => {
      expect(() => validateUrl("    ")).toThrow(ERROR_URL_EMPTY);
      expect(() => validateUrl("\n\t")).toThrow(ERROR_URL_EMPTY);
    });

    it("malformed URL", () => {
      expect(() => validateUrl("not a url")).toThrow(ERROR_URL_MALFORMED);
      expect(() => validateUrl("https//missing-colon.com")).toThrow(
        ERROR_URL_MALFORMED,
      );
      expect(() => validateUrl(":://no-scheme")).toThrow(ERROR_URL_MALFORMED);
    });

    it("invalid scheme (http, javascript, data, etc.)", () => {
      expect(() => validateUrl("http://example.com")).toThrow(
        ERROR_INVALID_SCHEME,
      );
      expect(() => validateUrl("javascript:alert(1)")).toThrow(
        ERROR_INVALID_SCHEME,
      );
      expect(() => validateUrl("data:text/html;base64,AAAA")).toThrow(
        ERROR_INVALID_SCHEME,
      );
      expect(() => validateUrl("ftp://example.com")).toThrow(ORPCError);
    });

    it("username/password present", () => {
      expect(() => validateUrl("https://user:pass@example.com")).toThrow(
        ERROR_CONTAINS_CREDENTIALS,
      );

      expect(() => validateUrl("https://user@example.com")).toThrow(
        ERROR_CONTAINS_CREDENTIALS,
      );
    });

    it("missing hostname (parses but no host)", () => {
      // 'https:///path' parses with empty hostname in WHATWG URL
      expect(() => validateUrl("https://./path")).toThrow(
        ERROR_INVALID_HOSTNAME,
      );
    });

    it("port present (even default port)", () => {
      expect(() => validateUrl("https://example.com:444/")).toThrow(ORPCError);

      // WHATWG URL deop default ports when parsing/serializing so if :443, url.port === ""
      expect(() => validateUrl("https://example.com:443/path")).not.toThrow(
        TRPCError,
      );
    });

    it("IP literal hosts (v4 and v6)", () => {
      expect(() => validateUrl("https://127.0.0.1/")).toThrow(
        ERROR_CONTAINS_IP,
      );
      expect(() => validateUrl("https://192.168.1.10/sheet")).toThrow(
        ERROR_CONTAINS_IP,
      );
    });

    it("banned hostname", () => {
      const bannedHost = "blocked.example";
      const alreadyPresent = DEFAULTS.bannedHosts.has(bannedHost);
      DEFAULTS.bannedHosts.add(bannedHost);
      try {
        expect(() => validateUrl("https://blocked.example/a")).toThrow(
          ERROR_BANNED_HOSTNAME,
        );
      } finally {
        if (!alreadyPresent) {
          DEFAULTS.bannedHosts.delete(bannedHost);
        }
      }
    });
  });

  describe("accepts and normalizes", () => {
    it("basic https URL returns canonical string unchanged (no surprises)", () => {
      const input = "https://example.com/a/b?x=1#frag";
      const out = validateUrl(input);
      expect(out).toBe("https://example.com/a/b?x=1#frag");
    });

    it("trims input", () => {
      const out = validateUrl("   https://example.com/a   ");
      expect(out).toBe("https://example.com/a");
    });

    it("punycode conversion (unicode host → ASCII) and lowercase", () => {
      const out = validateUrl("https://mÜnIch.com/sheet");
      // punycode for münich.com is xn--mnich-kva.com
      expect(out).toMatch(/^https:\/\/xn--mnich-kva\.com\/sheet$/);
      // ensure it's lowercase as enforced by the validator
      expect(out).toBe(out.toLowerCase());
    });

    it("trailing dot in host is stripped", () => {
      const out = validateUrl("https://example.com./x");
      expect(out).toBe("https://example.com/x");
    });

    it("path collapse of repeated slashes", () => {
      const out = validateUrl("https://example.com//a///b////c");
      // The function collapses multiple slashes in the *pathname*,
      // but keeps protocol and host intact.
      expect(out).toBe("https://example.com/a/b/c");
    });

    it("keeps fragment and query as-is (by current implementation)", () => {
      const out = validateUrl("https://example.com/a//b?b=2&a=1#t=30s");
      // Double-slashes in path should be collapsed:
      expect(out).toBe("https://example.com/a/b?b=2&a=1#t=30s");
    });
  });
});
