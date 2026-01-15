# Log Parsers

Guidelines for extracting actionable error details from CI logs.

## TypeScript Errors

Common patterns:

- `file.ts(12,34): error TS1234: message`
- `file.ts:12:34 - error TS1234: message`
- `file.ts:12:34 error TS1234: message`

Capture:

- file path
- line and column
- error code (TS####)
- message

## ESLint Errors

Common pattern:

- `file.ts:12:34 error message rule-name`
- `file.tsx:12:34 warning message rule-name`

Capture:

- file path
- line and column
- severity (error/warning)
- rule name
- message

## Test Failures

Typical markers:

- `FAIL` / `FAILED`
- `AssertionError`
- `Expected ... to ...`

Capture:

- test file
- failing test name
- assertion message

## Build Failures

Typical markers:

- `error` / `fatal` / `panic`
- `Module not found`
- `Compilation failed`

Capture:

- failing module or file
- error summary line
