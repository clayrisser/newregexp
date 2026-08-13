# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-08-13

Packaging and tooling only. **The regex you get back is unchanged** — the 2.0.0
build is checked against the 1.3.0 implementation over a corpus of inputs and
returns an identical pattern and flags for every one of them.

### Changed

- ships dual ESM + CJS builds with an `exports` map, `types`, `files` and
  `sideEffects`
- source is TypeScript; declarations are generated rather than hand-written
- toolchain is pnpm + oxfmt + oxlint + vitest + tsdown, driven by a Makefile
- requires Node 18 or newer

### Added

- test suite covering escaped delimiters, every valid flag combination, empty
  patterns, undelimited strings, invalid flags and trailing-slash-only input,
  at 100% coverage

### Removed

- `lib/` output, replaced by `dist/`
- babel, jest, eslint and prettier

### Compatibility

- `require("newregexp").default` still works, and still carries the
  `__esModule` marker 1.x published
- `import newRegExp from "newregexp"` still works

## [1.0.0] - 2018-10-31

### Added

- unit tests
- first release

## [0.0.1] - 2018-03-09

### Added

- initial release
