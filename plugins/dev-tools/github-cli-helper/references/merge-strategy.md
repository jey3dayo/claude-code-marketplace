# PR Merge Strategy - Detailed Guide

This guide provides comprehensive details on PR merge strategy with real-world examples and best practices.

## Philosophy

When merging a PR with multiple commits, the goal is to:

1. **Preserve essential information** - What changed and why
2. **Remove noise** - Ignore trivial commits (typo fixes, formatting)
3. **Follow standards** - Use Conventional Commits specification
4. **Enable traceability** - Link to PR/Issue numbers

## Conventional Commits Specification

### Format

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **refactor**: Code restructuring without behavior change
- **docs**: Documentation only changes
- **chore**: Maintenance tasks (dependencies, build, etc.)
- **test**: Adding or updating tests
- **style**: Code style changes (formatting, missing semicolons, etc.)
- **perf**: Performance improvements

### Scope

Optional, indicates the component or area affected:

- `(errors)` - Error handling module
- `(api)` - API layer
- `(ui)` - User interface
- `(auth)` - Authentication
- `(config)` - Configuration

## Real-World Examples from pr-labeler Project

### Example 1: Feature Addition

**PR #31**: Multiple commits including implementation, tests, and minor fixes

**Raw Commits**:

```
feat: add improvement actions formatter
feat: add best practices formatter
test: add tests for new formatters
fix: typo in comment
format: run prettier
chore: update snapshots
docs: update README
```

**Filtered (Essential Changes)**:

```
✅ feat: add improvement actions formatter
✅ feat: add best practices formatter
✅ test: add tests for new formatters
❌ fix: typo in comment
❌ format: run prettier
❌ chore: update snapshots
✅ docs: update README
```

**Generated Commit Message**:

```
Subject:
feat: PRサイズチェック - フィードバックメッセージの改善 (#31)

Body:
Issue #19の実装

## 変更内容

### 新機能追加

#### 1. 改善アクション提案（formatImprovementActions）
違反が発生した場合に表示される、具体的な改善提案：
- PR分割戦略（機能別、ファイル別、リファクタリング分離）
- 大きなファイルのリファクタリング方法
- 生成ファイル・ロックファイルの取り扱い

#### 2. ベストプラクティス（formatBestPractices）
常に表示される、PR作成のガイドライン：
- 推奨PRサイズ（400行未満推奨、1000行以上は避ける）
- ファイルサイズガイドライン（500行未満を目安）
- レビュー効率のヒント

### 統合箇所
- `src/report-formatter.ts`: 2つの新しいエクスポート関数を追加
- `src/actions-io.ts`: GitHub Actions Summaryに統合
- `src/comment-manager.ts`: PRコメントに統合

### テスト
- formatImprovementActionsのテストケース（7件）
- formatBestPracticesのテストケース（5件）
- スナップショットテストの更新

## 期待効果
- 開発者に具体的な改善アクションを提供
- チームのPRサイズに関する認識向上
- レビュー効率の改善

Closes #19
```

**Key Points**:

- Subject is concise (under 50 chars in English equivalent)
- Body is detailed with ALL significant changes
- Trivial commits (typo, format) are excluded
- Includes Issue number and Closes statement

### Example 2: Bug Fix with Context

**PR #27**: Build configuration issue

**Raw Commits**:

```
fix: exclude __tests__ from tsconfig
test: verify test files not in dist
feat: add vitest.config.ts
chore: update eslint config
wip: testing build
fix: typo
```

**Filtered (Essential Changes)**:

```
✅ fix: exclude __tests__ from tsconfig
✅ test: verify test files not in dist
✅ feat: add vitest.config.ts
✅ chore: update eslint config
❌ wip: testing build
❌ fix: typo
```

**Generated Commit Message**:

```
Subject:
fix: ビルド時に dist/ にテストファイルの型定義が出力される問題を修正 (#27)

Body:
- tsconfig.json を修正（__tests__ を exclude に追加）
- tsconfig.test.json を新規作成（テスト用の TypeScript 設定）
- vitest.config.ts を新規作成（テスト設定の明示化）
- eslint.config.js を修正（tsconfig.test.json を参照）

Fixes #26
```

**Key Points**:

- Subject clearly states the problem fixed
- Body lists all configuration changes
- Links to the issue that reported the bug
- "wip" and "typo" commits excluded

### Example 3: Refactoring

**PR #23**: Code quality improvement

**Raw Commits**:

```
refactor: extract common logic
refactor: unify error handling
test: add comprehensive tests
docs: update architecture docs
format: apply prettier
fix: lint errors
chore: update dependencies
```

**Filtered (Essential Changes)**:

```
✅ refactor: extract common logic
✅ refactor: unify error handling
✅ test: add comprehensive tests
✅ docs: update architecture docs
❌ format: apply prettier
❌ fix: lint errors
✅ chore: update dependencies
```

**Generated Commit Message**:

```
Subject:
refactor: コード重複解消と技術的負債の削減（Issue #12, #20） (#23)

Body:
## 変更内容

### リファクタリング
- 共通ロジックの抽出（DRY原則の適用）
- エラーハンドリングの統一化
- アーキテクチャドキュメントの更新

### テスト
- 包括的なテストケースの追加
- カバレッジ向上（82% → 85%）

### 依存関係
- 依存パッケージの更新

## 期待効果
- コードの保守性向上
- テストカバレッジの向上
- 技術的負債の削減

Closes #12, #20
```

**Key Points**:

- Multiple issues can be referenced
- Refactoring benefits are clearly stated
- Format and lint commits excluded
- Dependency updates included (as they're intentional)

## Commit Message Generation Algorithm

### Step-by-Step Process

**1. Fetch PR Data**

```bash
gh pr view <number> --json title,body,commits,files
```

**2. Analyze Commits**

For each commit in the PR:

```
1. Extract commit message
2. Apply filtering rules:
   IF message matches trivial patterns THEN
     exclude from analysis
   ELSE
     add to essential commits list
3. Group by type (feat/fix/refactor/etc.)
```

**3. Generate Subject**

```
1. Identify primary type (most common type in essential commits)
2. Extract scope (if consistent across commits)
3. Summarize essential change in <50 chars
4. Add PR number
5. Format: <type>(<scope>): <summary> (#number)
```

**4. Generate Body**

```
1. Start with "Issue #XX の実装" (if linked to issue)
2. Add "## 変更内容" section:
   - List ALL essential changes by category
   - Include file paths for context
   - Explain what and why (not just what)
3. Add "## 期待効果" section:
   - List expected benefits
   - Mention performance/quality improvements
4. Add footer with "Closes #XX" or "Fixes #XX"
```

**5. Confirm with User**

Before executing merge:

```
Show the generated commit message
Ask: "Proceed with merge? (y/n)"
If 'n', allow editing
```

**6. Execute Merge**

```bash
gh pr merge <number> --squash \
  --subject "<generated subject>" \
  --body "<generated body>"
```

## Filtering Rules (Trivial Commits)

### Pattern Matching

Exclude commits that match these patterns:

**Typo/Wording**:

- `fix typo`, `typo`, `correct typo`
- `wording`, `improve wording`
- `grammar`, `fix grammar`

**Formatting**:

- `format`, `formatting`, `reformat`
- `prettier`, `run prettier`, `apply prettier`
- `style`, `code style`

**Linting**:

- `lint`, `lint fix`, `fix lint`
- `eslint`, `fix eslint errors`

**Work in Progress**:

- `wip`, `wip:`, `WIP`
- `temp`, `temporary`, `tmp`
- `test commit`, `testing`

**Build Artifacts**:

- `chore: update dist [skip ci]`
- `Update dist`
- `Rebuild`

**Version Bumps** (unless that's the PR purpose):

- `bump version`
- `v1.0.0`, `release 1.0.0`

**Dependency Updates** (unless that's the PR purpose):

- `npm update`
- `yarn upgrade`
- `update dependencies`

### Keep These Commits

Include commits that represent essential changes:

**Features**:

- `feat:`, `feature:`
- `add:`, `implement:`

**Fixes**:

- `fix:` (except "fix typo", "fix lint")
- `bugfix:`, `hotfix:`

**Refactoring**:

- `refactor:`, `refactoring:`

**Documentation** (if substantial):

- `docs:` with significant content
- `update README` with new sections

**Tests**:

- `test:`, `tests:`
- `add tests`, `test coverage`

**Configuration** (if intentional):

- `config:` for build/CI changes
- `chore:` for dependency updates (if that's the PR purpose)

## Edge Cases

### Case 1: PR with Only Trivial Commits

If all commits are trivial:

```
Use PR title and description as base
Generate subject from PR title
Generate body from PR description
```

### Case 2: Multiple Types

If PR contains multiple types (feat + fix + refactor):

```
Choose primary type based on:
1. What's most significant
2. What the PR title emphasizes
3. What has most commits

Example: 5 feat commits, 2 fix commits → use "feat"
```

### Case 3: Very Large PR

If PR has 20+ essential commits:

```
Group by category:
## 変更内容

### 新機能
- Feature 1
- Feature 2

### バグ修正
- Fix 1
- Fix 2

### リファクタリング
- Refactor 1
```

### Case 4: Breaking Changes

If PR contains breaking changes:

```
Add "BREAKING CHANGE:" in body
Mention migration steps
Example:

BREAKING CHANGE: API endpoint renamed

Migration:
- Update /api/v1/users to /api/v2/users
- Update authentication headers
```

## Best Practices

### DO

✅ **Analyze the full context** - Read PR description and commits
✅ **Group related changes** - Organize by feature/fix/refactor
✅ **Include ALL significant changes** - Don't summarize to just 1-2 points
✅ **Use clear language** - Be specific about what changed
✅ **Link issues** - Use "Closes #XX" or "Fixes #XX"
✅ **Follow Conventional Commits** - Use correct types and format
✅ **Confirm before merging** - Show the message to the user

### DON'T

❌ **Don't include trivial commits** - Filter out typo/format/wip
❌ **Don't be vague** - "Various improvements" is not helpful
❌ **Don't exceed 50 chars in subject** - Keep it concise
❌ **Don't forget PR number** - Always include (#XX)
❌ **Don't skip the body** - Detailed information is valuable
❌ **Don't merge without confirmation** - Show the message first
❌ **Don't summarize to 1-2 sentences** - List ALL major changes

## Quality Checklist

Before executing merge, verify:

- [ ] Subject follows Conventional Commits format
- [ ] Subject is under 50 characters
- [ ] Subject includes PR number
- [ ] Type (feat/fix/refactor) matches the primary change
- [ ] Body lists ALL significant changes (not just 1-2)
- [ ] Trivial commits are excluded from body
- [ ] Issue numbers are linked (Closes/Fixes)
- [ ] Expected benefits are mentioned
- [ ] Message is clear and informative
- [ ] User has confirmed the message

## References

- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub CLI Documentation](https://cli.github.com/manual/)
- [How to Write a Git Commit Message](https://chris.beams.io/posts/git-commit/)
- [pr-labeler Project](https://github.com/jey3dayo/pr-labeler) - Real-world examples
