# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-08-13

### Added

- ESM build alongside CommonJS, with an `exports` map and type declarations
  for both.
- `newRegExp` named export, in addition to the default export.
- Test suite covering every flag, patterns containing slashes, escaped
  delimiters, empty and malformed input, cross-realm `RegExp` passthrough, and
  the error behaviour. 100% coverage.
- `Makefile` + `make.mk`, `.tool-versions`, oxfmt and oxlint.

### Changed

- Ported to TypeScript. `tsdown` builds both formats and emits declarations.
- **Breaking.** Anything other than a string or a `RegExp` now throws a
  `TypeError`. It was previously handed to the `RegExp` constructor, so
  `newRegExp(undefined)` returned `/(?:)/` — a regex matching every string —
  and `newRegExp(null)` returned `/null/`.
- **Breaking.** Minimum Node is 20, up from 6.
- Package manager is pnpm. Babel, ESLint, Prettier and Jest are gone.

### Fixed

- The published type declarations contradicted the runtime: they said
  `export = newRegExp` while the runtime exported `exports.default`, so
  TypeScript accepted `require("newregexp")("/a/g")`, which threw at runtime.
  The declarations now describe what is actually exported. The runtime shape is
  unchanged, so `require("newregexp").default` keeps working.
- A pattern containing a newline is now recognised as a literal. The pattern
  was matched with `.`, which does not cross a newline, so `"/a\nb/m"` was
  silently used verbatim and produced a regex matching that literal text.

## [1.0.0] - 2018-10-31

### Added

- unit tests
- first release

## [0.0.1] - 2018-03-09

### Added

- initial release
