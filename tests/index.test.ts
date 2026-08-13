import { describe, expect, it } from "vitest";
import newRegExp from "../src/index.js";

// `toEqual` on two RegExps compares source and flags, so these assertions are
// about the regex that was built, not about object identity.

describe("literal strings", () => {
  it("parses a pattern with flags", () => {
    expect(newRegExp("/hello/gi")).toEqual(/hello/gi);
  });

  it("parses a pattern with no flags", () => {
    expect(newRegExp("/hello/")).toEqual(/hello/);
  });

  it("keeps the pattern and the flags apart", () => {
    const regex = newRegExp("/^a+b$/im");
    expect(regex.source).toBe("^a+b$");
    expect(regex.flags).toBe("im");
  });

  it("works end to end", () => {
    expect(newRegExp("/hello/").test("hello")).toBe(true);
    expect(newRegExp("/hello/").test("HELLO")).toBe(false);
    expect(newRegExp("/hello/i").test("HELLO")).toBe(true);
  });
});

describe("empty pattern", () => {
  it("parses an empty pattern", () => {
    expect(newRegExp("//")).toEqual(new RegExp(""));
    expect(newRegExp("//").source).toBe("(?:)");
  });

  it("parses an empty pattern with flags", () => {
    expect(newRegExp("//gimsuy")).toEqual(new RegExp("", "gimsuy"));
    expect(newRegExp("//gimsuy").flags).toBe("gimsuy");
  });

  it("matches everything, as an empty regex does", () => {
    expect(newRegExp("//").test("anything")).toBe(true);
  });
});

describe("flags", () => {
  // Every flag the language currently defines. `v` is left out of the list
  // because it cannot be combined with `u`; it gets its own case below.
  const flags = ["d", "g", "i", "m", "s", "u", "y"] as const;

  it.each(flags)("accepts the %s flag on its own", (flag) => {
    expect(newRegExp(`/a/${flag}`).flags).toBe(flag);
  });

  it("accepts the v flag", () => {
    expect(newRegExp("/a/v").flags).toBe("v");
  });

  it("accepts every compatible flag at once", () => {
    expect(newRegExp("/a/dgimsuy").flags).toBe(/a/dgimsuy.flags);
  });

  it("normalises flag order", () => {
    // RegExp sorts flags, so the input order is not preserved.
    expect(newRegExp("/hello/mgiyu")).toEqual(/hello/gimuy);
    expect(newRegExp("/hello/mgiyu").flags).toBe("gimuy");
  });

  it("rejects a duplicated flag", () => {
    expect(() => newRegExp("/a/gg")).toThrow(SyntaxError);
  });

  it("rejects u and v together", () => {
    expect(() => newRegExp("/a/uv")).toThrow(SyntaxError);
  });

  it("throws SyntaxError for flags that are not flags", () => {
    expect(() => newRegExp("//abc")).toThrow(SyntaxError);
    expect(() => newRegExp("//abc")).toThrow(/[Ii]nvalid flags/);
  });
});

describe("slashes inside the pattern", () => {
  it("handles an escaped delimiter", () => {
    const regex = newRegExp("/a\\/b/g");
    expect(regex.source).toBe("a\\/b");
    expect(regex.flags).toBe("g");
    expect(regex.test("a/b")).toBe(true);
  });

  it("treats the last slash as the delimiter", () => {
    // "/a/b/g" is the pattern a/b with flag g, not the pattern a with flags b.
    const regex = newRegExp("/a/b/g");
    expect(regex.source).toBe("a\\/b");
    expect(regex.flags).toBe("g");
    expect(regex.test("xa/by")).toBe(true);
  });

  it("handles an unescaped slash with no flags", () => {
    expect(newRegExp("/a/b/").source).toBe("a\\/b");
  });

  it("handles a pattern that is only a slash", () => {
    expect(newRegExp("///").source).toBe("\\/");
    expect(newRegExp("///").test("/")).toBe(true);
  });

  it("handles a path-shaped pattern", () => {
    const regex = newRegExp("/^\\/api\\/v[0-9]+\\//");
    expect(regex.test("/api/v2/users")).toBe(true);
    expect(regex.test("/apiv2/users")).toBe(false);
  });
});

describe("strings with no delimiters", () => {
  it("uses a bare string as the pattern", () => {
    expect(newRegExp("hello")).toEqual(/hello/);
    expect(newRegExp("hello").flags).toBe("");
  });

  it("treats an empty string as an empty pattern", () => {
    expect(newRegExp("")).toEqual(new RegExp(""));
  });

  it("keeps regex syntax working in a bare string", () => {
    expect(newRegExp("^a+b$").test("aab")).toBe(true);
  });

  it("throws SyntaxError for a bare string that is not a valid pattern", () => {
    expect(() => newRegExp("[")).toThrow(SyntaxError);
  });
});

describe("strings that only look like literals", () => {
  it("does not treat a lone slash as a literal", () => {
    // A trailing slash and nothing else: there is no closing delimiter, so the
    // slash is the whole pattern.
    expect(newRegExp("/")).toEqual(new RegExp("/"));
    expect(newRegExp("/").source).toBe("\\/");
    expect(newRegExp("/").test("/")).toBe(true);
  });

  it("does not treat an unterminated literal as a literal", () => {
    expect(newRegExp("/hello")).toEqual(new RegExp("/hello"));
    expect(newRegExp("/hello").test("/hello")).toBe(true);
  });

  it("does not treat a trailing uppercase flag as a literal", () => {
    // Only [a-z] counts as a flag position, so "G" makes the whole string the
    // pattern rather than a literal with a bad flag.
    expect(newRegExp("/hello/G").source).toBe("\\/hello\\/G");
  });

  it("does not treat a pattern spanning a newline as a literal", () => {
    // `.` does not match a newline, so this is used verbatim. Pinned because
    // it is the 1.x behaviour, not because it is obviously right.
    const regex = newRegExp("/a\nb/m");
    // `source` escapes the newline it was built from, hence \\n rather than a
    // literal line break.
    expect(regex.source).toBe("\\/a\\nb\\/m");
    expect(regex.flags).toBe("");
    expect(regex.test("/a\nb/m")).toBe(true);
  });
});

describe("RegExp passthrough", () => {
  it("returns the same object", () => {
    const regex = /hello/g;
    expect(newRegExp(regex)).toBe(regex);
  });

  it("preserves flags", () => {
    expect(newRegExp(/hello/gimsy).flags).toBe("gimsy");
  });
});

describe("values that are not strings", () => {
  // 1.x handed these to the RegExp constructor rather than rejecting them.
  // Pinned so the coercion cannot be dropped by accident.
  it.each([
    ["undefined", undefined, "(?:)"],
    ["null", null, "null"],
    ["a number", 42, "42"],
    ["a boolean", true, "true"],
  ])("coerces %s the way the RegExp constructor does", (_label, value, source) => {
    // @ts-expect-error deliberately passing a type the signature forbids
    expect(newRegExp(value).source).toBe(source);
  });
});
