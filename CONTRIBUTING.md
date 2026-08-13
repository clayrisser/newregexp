# Contributing

The source lives on [GitLab](https://gitlab.com/bitspur/misc/newregexp).
Report problems as [issues](https://gitlab.com/bitspur/misc/newregexp/-/issues)
and send changes as merge requests.

This package is feature-complete — see the scope note in the
[README](README.md). Bug reports, packaging fixes and toolchain updates are
welcome. New options and new behaviour are almost certainly not: the package
exists to do one small thing, and anything larger belongs in your own code.

## Working on it

```sh
make prepare   # asdf toolchain + pnpm install
make lint      # oxlint + oxfmt + tsc --noEmit
make test      # vitest; coverage is enforced at 100%
make build     # dual ESM + CJS into dist/
```

Two rules that the test suite enforces, and that a change must not break:

- **Behaviour is frozen at 1.x.** Existing callers get exactly the regex they
  got before, quirks included.
- **CommonJS reaches the function through `.default`.** That is what 1.x
  published, so `require("newregexp").default` has to keep working.
