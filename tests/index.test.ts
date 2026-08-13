import vm from "node:vm";
import { describe, expect, it } from "vitest";
import newRegExp, { newRegExp as named } from "../src/index.js";

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
  // Every flag the language currently defines. `v` is excluded here because it
  // cannot be combined with `u`; it gets its own case below.
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
    // Deliberately not a fallback to treating the whole string as a pattern:
    // "//abc" is literal-shaped, so bad flags are an error, not a hint.
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
    // One slash and nothing else: there is no closing delimiter, so the slash
    // is the pattern.
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
});

describe("newlines in the pattern", () => {
  it("recognises a literal whose pattern spans a newline", () => {
    // 1.x matched the pattern with `.`, which does not cross a newline, so
    // this was silently used verbatim and produced a regex matching the
    // literal text "/a\nb/m". The pattern group matches any character now.
    const regex = newRegExp("/a\nb/m");
    // Flags of "m" rather than "" is the tell: on the verbatim path the whole
    // string becomes the pattern and there are no flags at all.
    expect(regex.flags).toBe("m");
    expect(regex.test("a\nb")).toBe(true);
    // `source` escapes line terminators so that it round-trips as a literal,
    // so this is a backslash and an n, not a newline.
    expect(regex.source).toBe("a\\nb");
  });

  it("handles a carriage return the same way", () => {
    expect(newRegExp("/a\r\nb/").test("a\r\nb")).toBe(true);
    expect(newRegExp("/a\r\nb/").source).toBe("a\\r\\nb");
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

  it("passes through a RegExp from another realm", () => {
    // The guard is a brand check rather than `instanceof` precisely for this:
    // a RegExp built in another realm has a different RegExp.prototype, so
    // `instanceof` says no while it is still a perfectly good RegExp.
    const foreign = vm.runInNewContext("/hello/g") as RegExp;
    expect(foreign instanceof RegExp).toBe(false);
    expect(newRegExp(foreign)).toBe(foreign);
  });
});

describe("invalid input", () => {
  it.each([
    ["undefined", undefined],
    ["null", null],
    ["a number", 42],
    ["a boolean", true],
    ["an object", {}],
    ["an array", ["/a/"]],
    ["a function", () => "/a/"],
    ["a symbol", Symbol("a")],
  ])("throws TypeError for %s", (_label, value) => {
    // @ts-expect-error deliberately passing a type the signature forbids
    expect(() => newRegExp(value)).toThrow(TypeError);
  });

  it("names what it received", () => {
    // @ts-expect-error deliberately passing a type the signature forbids
    expect(() => newRegExp(null)).toThrow("newRegExp expected a string or a RegExp, received null");
    // @ts-expect-error deliberately passing a type the signature forbids
    expect(() => newRegExp(42)).toThrow("newRegExp expected a string or a RegExp, received number");
  });

  it("does not fail open on undefined", () => {
    // 1.x handed `undefined` to the RegExp constructor, which returns /(?:)/ —
    // a regex that matches every string. Anything using this to gate an
    // allowlist would have failed open rather than loudly.
    // @ts-expect-error showing what 1.x did with undefined
    expect(new RegExp(undefined).test("anything at all")).toBe(true);
    // @ts-expect-error deliberately passing a type the signature forbids
    expect(() => newRegExp(undefined)).toThrow(TypeError);
  });
});

describe("exports", () => {
  it("exposes the same function as the default and the named export", () => {
    expect(named).toBe(newRegExp);
  });
});
