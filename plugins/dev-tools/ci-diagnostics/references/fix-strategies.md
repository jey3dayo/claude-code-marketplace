# Fix Strategies

Suggested remediation tactics by failure type.

## type_error

- Add missing types or generics
- Align types between layers or APIs
- Update type definitions or schema
- Add type guards when narrowing is required

## lint_error

- Run eslint auto-fix where safe
- Resolve remaining rule violations manually
- Consider rule exceptions only with justification

## test_failure

- Identify failing assertions and compare expected vs actual
- Fix test data/mocks to align with latest behavior
- Update snapshots only when behavior is confirmed correct

## build_error

- Review build logs for missing modules or config
- Validate dependency versions and lockfile
- Fix bundler or build pipeline configuration

## unknown

- Inspect logs around failure markers
- Re-run failing workflow locally if possible
- Narrow down to a specific tool before applying fixes
