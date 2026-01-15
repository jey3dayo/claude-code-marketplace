---
name: dotenvx
description: |
  Secure environment variable management with AES-256 encryption for safe Git commits.

  Use when managing .env files (create, encrypt, decrypt), encrypting secrets for Git commits, multi-environment deployments (staging, production), CI/CD integration with encrypted environment variables, or CDK/Terraform/Docker environment management.

  Triggers on keywords: "dotenvx", "環境変数暗号化", "secure env", ".env encryption", "environment variables", "env management", "環境変数", "暗号化", "セキュアな環境設定"
---

# dotenvx - Secure Environment Variable Management

## Overview

dotenvxは、環境変数ファイルをAES-256で暗号化し、安全にGit管理できる次世代ツール。**Context7 MCPで最新ドキュメントを参照**し、プロジェクト固有の統合とポリシーに集中。

**Context7 Libraries**:

- `/dotenvx/dotenvx` - Official documentation (189 snippets, score 92.2)
- `/llmstxt/dotenvx_llms-full_txt` - Comprehensive reference (542 snippets)

## Context7 Integration

### Installation

```markdown
Query: "How to install dotenvx in a Node.js project? Project-local vs global installation"
Query: "Install dotenvx globally with curl, Homebrew, or npm"
Library: /dotenvx/dotenvx
```

### Encryption/Decryption

```markdown
Query: "How to encrypt and decrypt .env files? dotenvx encrypt and decrypt workflow"
Query: "Run commands with encrypted env variables? DOTENV_PRIVATE_KEY usage"
Library: /dotenvx/dotenvx
```

### Multi-Environment

```markdown
Query: "Manage multiple environments .env.production .env.staging? Load with -f flag"
Query: "Load multiple .env files in sequence? Precedence rules and dotenv-flow"
Library: /dotenvx/dotenvx
```

### CI/CD & Security

```markdown
Query: "CI/CD integration with GitHub Actions? DOTENV_PRIVATE_KEY in workflows"
Query: "Key rotation and security best practices? Managing .env.keys safely"
Library: /dotenvx/dotenvx
```

## Project-Specific Integrations

### CDK

```json
{
  "scripts": {
    "deploy:staging": "dotenvx run -f .env.staging -- cdk deploy",
    "deploy:production": "dotenvx run -f .env.production -- cdk deploy"
  },
  "devDependencies": {
    "@dotenvx/dotenvx": "^1.34.1"
  }
}
```

### Terraform

```bash
dotenvx run -f .env.production -- terraform plan
dotenvx run -f .env.staging -- terraform workspace select staging
```

### Docker

```dockerfile
FROM node:20-alpine
RUN curl -sfS https://dotenvx.sh | sh
COPY .env.production .env.keys ./
CMD ["dotenvx", "run", "-f", ".env.production", "--", "node", "server.js"]
```

## Automation Scripts

- **`scripts/setup-dotenvx.sh [env]`** - 初期セットアップ (install, .gitignore, templates)
- **`scripts/rotate-keys.sh [env]`** - キーローテーション (backup, decrypt, re-encrypt)
  - 使用タイミング: 90日ごと、チームメンバー退職時、キー漏洩疑い時
- **`scripts/verify-encryption.sh [env]`** - 暗号化検証 (file state, .env.keys, .gitignore)

## Template Assets

- `.gitignore.template` - dotenvx 最適化設定
- `github-workflow.yml` - GitHub Actions デプロイ (staging/production)
- `package-scripts.json` - package.json scripts テンプレート

## Security Best Practices

### ✅ DO

- 暗号化されたファイルのみコミット
- 秘密鍵を1Password/Vault/Secrets Managerで共有
- `.env.keys`を.gitignoreに追加
- CI/CDで`DOTENV_PRIVATE_KEY_PRODUCTION`使用

### ❌ DON'T

- 平文.envをコミット
- `.env.keys`をコミット
- Slack/メールで鍵送信
- 本番/ステージングで同じ鍵共有

## .gitignore Setup

```gitignore
# Environment files (sensitive)
.env
.env.*
!.env.test
!.env.*.example

# dotenvx keys (NEVER commit)
.env.keys
.env.vault
```

## Operational Workflows

### Daily Development

1. 編集: `npx dotenvx decrypt -f .env.staging`
2. 暗号化: `npx dotenvx encrypt -f .env.staging`
3. 確認: `npx dotenvx run -f .env.staging -- npm start`
4. コミット: 暗号化ファイルのみ

### Deployment

```bash
npm run deploy:staging     # dotenvx run -f .env.staging -- cdk deploy
npm run deploy:production  # dotenvx run -f .env.production -- cdk deploy
```

### Key Management

- **配布**: 1Password または AWS Secrets Manager
- **ローテーション**: 90日ごとに `rotate-keys.sh` 実行
- **検証**: デプロイ前に `verify-encryption.sh` で確認

## Troubleshooting

### Environment variables not loading

1. `.env.keys` が存在するか確認
2. 正しい環境ファイル: `dotenvx run -f .env.production`
3. 暗号化確認: `head -n 1 .env.production` (should start with `#/---`)

### Encryption/Decryption fails

1. バージョン確認: `npx dotenvx --version`
2. 更新: `npm update @dotenvx/dotenvx`
3. `.env.keys` 一致確認、1Passwordから再取得

### CI/CD fails

GitHub Secrets 設定:

```yaml
- name: Deploy
  env:
    DOTENV_PRIVATE_KEY_PRODUCTION: ${{ secrets.DOTENV_PRIVATE_KEY_PRODUCTION }}
  run: npm run deploy:production
```

## Advanced Topics

詳細: `references/dotenvx-details.md`

- Architecture & Encryption Mechanism (AES-256-GCM)
- Multi-Environment Management (優先順位、ワイルドカード)
- CI/CD Integration (GitHub Actions, GitLab CI, CircleCI)
- Migration Guide (dotenv, AWS Parameter Store)
- Performance Considerations (ベンチマーク、キャッシング)
- Security Deep Dive (脅威モデル、SOC 2, HIPAA)

## Related Resources

- [Official Docs](https://dotenvx.com/docs)
- [GitHub](https://github.com/dotenvx/dotenvx)
- `references/dotenvx-details.md`
