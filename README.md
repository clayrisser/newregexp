# newregexp

> Dynamically create regular expressions from strings

![](assets/newregexp.png)

JavaScript can build a `RegExp` from a pattern string, but it has no way to
read a whole regex _literal_ — `"/hello/gi"` — back out of a string. That is
the shape regexes take when they arrive from a config file, an environment
variable, a CLI flag or a JSON document. This turns that string into the regex
it looks like.

## Install

```sh
pnpm add newregexp
```

## Usage

```ts
import newRegExp from "newregexp";

newRegExp("/hello/gi"); // /hello/gi
newRegExp("/hello/"); //  /hello/
newRegExp("hello"); //    /hello/    — no delimiters, so the whole string is the pattern
newRegExp(/hello/g); //   /hello/g   — a RegExp passes straight through
```

A named export is available too, and is the same function:

```ts
import { newRegExp } from "newregexp";
```

CommonJS:

```js
const { newRegExp } = require("newregexp");
// or, unchanged from 1.x:
const newRegExp = require("newregexp").default;
```

## Rules

| Input         | Result         | Why                                               |
| ------------- | -------------- | ------------------------------------------------- |
| `"/hello/gi"` | `/hello/gi`    | literal-shaped, so the flags are read off the end |
| `"/hello/"`   | `/hello/`      | literal-shaped with no flags                      |
| `"//"`        | `/(?:)/`       | literal-shaped with an empty pattern              |
| `"hello"`     | `/hello/`      | no delimiters, so the whole string is the pattern |
| `""`          | `/(?:)/`       | same, with an empty pattern                       |
| `"/hello"`    | `/\/hello/`    | no closing delimiter, so not a literal            |
| `"/hello/G"`  | `/\/hello\/G/` | `G` is not a flag character, so not a literal     |
| `"/a/b/g"`    | `/a\/b/g`      | the **last** slash closes the pattern             |
| `/hello/g`    | `/hello/g`     | the same object, not a copy                       |

The last row of that table is the rule worth remembering: the pattern is
matched greedily, so an unescaped slash inside it works. `"/a/b/g"` is the
pattern `a/b` with flag `g`, not the pattern `a` with flags `b`. Escaping it
yourself (`"/a\\/b/g"`) gives the same result.

## Errors

| Input                                       | Throws                                                                 |
| ------------------------------------------- | ---------------------------------------------------------------------- |
| `"//abc"`                                   | `SyntaxError` — literal-shaped, but `abc` are not valid flags          |
| `"/[/"`                                     | `SyntaxError` — literal-shaped, but `[` is not a valid pattern         |
| `"["`                                       | `SyntaxError` — from the `RegExp` constructor, as with any bad pattern |
| `undefined`, `null`, a number, an object, … | `TypeError`                                                            |

Note that a literal-shaped string with bad flags is an error rather than a
fallback to treating the whole thing as a pattern. If the string looks like a
literal, it is parsed as one, and getting it wrong is worth hearing about.

## Migrating from 1.x

The function behaves the same for every valid input. Three things changed.

**ESM is now shipped alongside CommonJS.** 1.x was CommonJS only. The package
now has an `exports` map with real type declarations on both sides.

**The type declarations used to be wrong.** 1.x shipped
`declare function newRegExp(...); declare module "newregexp" { export = newRegExp }`
while the runtime was `exports.default = newRegExp`. TypeScript therefore
type-checked this:

```js
const newRegExp = require("newregexp");
newRegExp("/a/g"); // TypeError: newRegExp is not a function
```

The runtime shape is unchanged — `require("newregexp").default` works exactly
as it did — but the declarations now describe it, and a named export was added
so `require("newregexp").newRegExp` reads better.

**Invalid input throws instead of being coerced.** 1.x passed anything
non-string to the `RegExp` constructor, so `newRegExp(undefined)` returned
`/(?:)/` — a regex matching every string. Code using that to gate an allowlist
failed open. It is a `TypeError` now.

One bug fix worth calling out: a pattern containing a newline is recognised as
a literal. 1.x matched the pattern with `.`, which does not cross a newline, so
`"/a\nb/m"` was silently used verbatim and produced a regex matching that
literal text.

Minimum Node is 20.

## Development

```sh
make prepare   # asdf toolchain + pnpm install
make build     # ESM + CJS + declarations, via tsdown
make test      # vitest with coverage
make lint      # oxlint, oxfmt --check, tsc --noEmit
```

## License

[MIT](LICENSE)
