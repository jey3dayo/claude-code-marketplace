---
name: ci-diagnostics
description: |
  [What] Diagnose GitHub Actions CI failures and generate fix plans
  [When] Use when: /review --fix-ci or CI failure diagnosis is needed
  [Keywords] CI failure, GitHub Actions, workflow failure, CI diagnostics
  [Scope] GitHub Actions only; external CI reported as out of scope
  [Note] Always respond in Japanese.
---

# CI Diagnostics

## Overview

Diagnose GitHub Actions failures, classify failure types, and generate fix plans for approval. This skill focuses on analysis and planning; execution is delegated to the appropriate agent after user confirmation.

**Prerequisites**: gh CLI authenticated with workflow/repo scopes.

## Quick Start

```bash
/review --fix-ci           # current branch PR
/review --fix-ci 123       # explicit PR number
/review --fix-ci --dry-run # diagnosis only
/review --fix-ci --fix-pr  # CI diagnosis + PR comment fixes
```

## Workflow

1. Resolve PR number (current branch or explicit argument)
2. Fetch failing checks (GitHub Actions only)
3. Pull logs for failed runs
4. Classify failures (type, lint, test, build, unknown)
5. Extract error details and affected files
6. Generate fix plan and recommended agent/skills
7. Request user approval
8. Apply fixes and re-run quality gates

## Outputs

- Summary of failed checks
- Failure type and priority per check
- Extracted error details (file/line/message)
- Fix strategy suggestions
- Recommended agent/skills

## Resources

- **`references/log-parsers.md`** - Parsing patterns for TS/ESLint/test logs
- **`references/failure-patterns.md`** - Failure classification guidance
- **`references/fix-strategies.md`** - Suggested repair tactics per failure type

**Read when**: Adding new failure types, updating parsing logic, or tuning fix strategies.

## Related Skills

- **gh-fix-ci**: Fetch and inspect failing checks using gh CLI
- **code-quality-improvement**: Lint/format remediation guidance
- **typescript**: Type error interpretation and fixes
