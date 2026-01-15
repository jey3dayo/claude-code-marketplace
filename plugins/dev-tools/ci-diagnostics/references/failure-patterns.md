# Failure Patterns

Classify failures to drive consistent priorities and fix strategies.

## Categories

- type_error: TypeScript compilation or type-check failures
- lint_error: ESLint or style rule violations
- test_failure: Unit/integration test failures
- build_error: Build/compile/bundle failures
- unknown: Anything not captured above

## Signals

- Check name keywords: type, tsc, typescript, lint, eslint, test, jest, pytest, build
- Log content keywords: error TS, eslint, FAIL, AssertionError, build failed

## Priority Heuristics

- high: type_error, test_failure, or >10 errors
- medium: lint_error
- low: unknown or isolated warnings

Adjust based on project criticality and error density.
