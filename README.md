# newregexp

> Turn a `"/pattern/flags"` string into a `RegExp`

![](assets/newregexp.png)

Config files, environment variables and CLI arguments can only hold strings. If
you want a user to be able to write a regex in one — flags and all — something
has to turn `"/^user-\d+$/i"` into a real `RegExp`. That is the whole job.

## Install

```sh
pnpm add newregexp
```

## Use

```js
import newRegExp from "newregexp";

newRegExp("/hello/gi"); // /hello/gi
newRegExp("/hello/"); // /hello/
newRegExp("hello"); // /hello/     — no delimiters, so the string is the pattern
newRegExp(/hello/g); // /hello/g   — a RegExp is returned untouched
```

CommonJS reaches it through `.default`, the same as it did in 1.x:

```js
const newRegExp = require("newregexp").default;
```

The argument is either a `RegExp`, which comes back as-is, or a string. A
string that looks like `/pattern/flags` is split on its **last** slash, so a
slash inside the pattern needs no special handling:

```js
newRegExp("/a/b/g").source; // "a\\/b"   — pattern a/b, flag g
```

Anything else becomes the pattern verbatim, with no flags. Invalid flags or an
unparseable pattern throw whatever `new RegExp()` throws, which is a
`SyntaxError`.

## Scope

This package is finished. It is fifteen lines, it has no dependencies, and it
does one thing. Bug reports and packaging fixes are welcome; feature requests
almost certainly are not — if you need more than this, you need `new RegExp()`
directly.

Behaviour is unchanged from 1.x, quirks included: `"/hello/G"` is not a literal
because `G` is not in `[a-z]`, and a pattern containing a newline is not
recognised as a literal either. Both are pinned by tests so they cannot drift.

## Develop

```sh
make prepare   # asdf toolchain + pnpm install
make build     # dual ESM + CJS into dist/
make test      # vitest, 100% coverage enforced
make lint      # oxlint + oxfmt + tsc --noEmit
```

## License

[MIT](LICENSE)
