# dotenvx Detailed Reference

This document provides comprehensive documentation for dotenvx usage, advanced features, and best practices.

## Table of Contents

1. [Architecture](#architecture)
2. [Encryption Mechanism](#encryption-mechanism)
3. [Multi-Environment Management](#multi-environment-management)
4. [CI/CD Integration](#cicd-integration)
5. [Advanced Configuration](#advanced-configuration)
6. [Migration Guide](#migration-guide)
7. [Performance Considerations](#performance-considerations)
8. [Security Deep Dive](#security-deep-dive)

## Architecture

### How dotenvx Works

```
┌─────────────────────────────────────────────┐
│ Application Code (process.env.DATABASE_URL)│
└──────────────────┬──────────────────────────┘
                   │
                   │ (3) Environment variables injected
                   │
         ┌─────────▼─────────┐
         │   dotenvx run     │
         └─────────┬─────────┘
                   │
    ┌──────────────┼──────────────┐
    │ (1) Read     │  (2) Decrypt │
    ▼              ▼              │
┌──────────┐  ┌──────────┐       │
│.env.prod │  │.env.keys │       │
│(encrypted)│  │(secrets) │       │
└──────────┘  └──────────┘       │
    │              │              │
    └──────────────┴──────────────┘
```

### File Structure

```
project-root/
├── .env                    # Local development (gitignored)
├── .env.production         # Encrypted production vars (committed)
├── .env.staging            # Encrypted staging vars (committed)
├── .env.test               # Test vars (can be committed)
├── .env.keys               # Encryption keys (NEVER commit)
└── .gitignore              # Protect sensitive files
```

## Encryption Mechanism

### AES-256-GCM Encryption

dotenvx uses **AES-256-GCM** (Galois/Counter Mode) for encryption:

- **AES-256**: 256-bit key length (military-grade)
- **GCM Mode**: Authenticated encryption (integrity + confidentiality)
- **Unique IV**: Each encryption uses a unique initialization vector
- **Authentication Tag**: Prevents tampering

### Encryption Process

1. **Generate Key** (first time):

```bash
$ dotenvx encrypt -f .env.production

Generated key: a2e09d2d781b9a4c196d492d59f4ab61c43e0945fc5fd842bc0e4f381664b9fa
```

2. **File Format** (encrypted):

```
#/-------------------[DOTENV_PUBLIC_KEY]--------------------/
#/            public-key:03c48eb...d3e2a89a               /
#/----------------------------------------------------------/
DATABASE_URL="encrypted:BMx5o...jQ6x5Dw"
AWS_SECRET="encrypted:kL8pN...vM3wZy"
```

3. **Key Storage** (`.env.keys`):

```
DOTENV_PRIVATE_KEY_PRODUCTION="a2e09d2d781b9a4c196d492d59f4ab61..."
DOTENV_PRIVATE_KEY_STAGING="5795063520440bbcb4d761f512620b50..."
```

### Decryption Process

```bash
# Decrypt for editing
$ dotenvx decrypt -f .env.production

# File becomes plaintext
DATABASE_URL="postgres://localhost/mydb"
AWS_SECRET="supersecretkey"

# Re-encrypt after editing
$ dotenvx encrypt -f .env.production
```

## Multi-Environment Management

### Environment File Naming

| Environment | File Name          | Encryption Key Variable          |
| ----------- | ------------------ | -------------------------------- |
| Production  | `.env.production`  | `DOTENV_PRIVATE_KEY_PRODUCTION`  |
| Staging     | `.env.staging`     | `DOTENV_PRIVATE_KEY_STAGING`     |
| Development | `.env.development` | `DOTENV_PRIVATE_KEY_DEVELOPMENT` |
| Testing     | `.env.test`        | (Usually not encrypted)          |
| Local       | `.env`             | (Gitignored, not encrypted)      |

### Loading Specific Environments

```bash
# Load production environment
dotenvx run -f .env.production -- node app.js

# Load multiple environments (precedence: right to left)
dotenvx run -f .env -f .env.production -- node app.js

# Load with wildcard (all .env.* files)
dotenvx run -f .env.* -- node app.js
```

### Environment Variable Precedence

Precedence (highest to lowest):

1. **System environment variables** (`export DATABASE_URL=...`)
2. **Right-most -f file** (`-f .env -f .env.production`)
3. **Left-most -f file**
4. **Default `.env`** (if exists)

Example:

```bash
# System env (highest)
export DATABASE_URL="system-db"

# .env.production (medium)
DATABASE_URL="prod-db"

# .env (lowest)
DATABASE_URL="local-db"

# Result: DATABASE_URL="system-db"
```

## CI/CD Integration

### GitHub Actions

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"

      - name: Install dependencies
        run: npm ci

      - name: Deploy
        env:
          DOTENV_PRIVATE_KEY_PRODUCTION: ${{ secrets.DOTENV_PRIVATE_KEY_PRODUCTION }}
        run: npm run deploy:production
```

### GitLab CI

```yaml
deploy:production:
  stage: deploy
  script:
    - npm ci
    - npm run deploy:production
  variables:
    DOTENV_PRIVATE_KEY_PRODUCTION: $DOTENV_PRIVATE_KEY_PRODUCTION
  only:
    - main
```

### CircleCI

```yaml
version: 2.1

jobs:
  deploy:
    docker:
      - image: cimg/node:20.11
    steps:
      - checkout
      - run: npm ci
      - run: npm run deploy:production
    environment:
      DOTENV_PRIVATE_KEY_PRODUCTION: $DOTENV_PRIVATE_KEY_PRODUCTION
```

### Setting Secrets in CI/CD

**GitHub**:

```bash
gh secret set DOTENV_PRIVATE_KEY_PRODUCTION --body "a2e09d2d..."
```

**GitLab**:
Settings → CI/CD → Variables → Add Variable

**CircleCI**:
Project Settings → Environment Variables → Add Variable

## Advanced Configuration

### Custom Encryption Algorithm

```bash
# Use different encryption (not recommended unless required)
dotenvx encrypt -f .env.production --algorithm aes-128-gcm
```

### Selective Variable Encryption

Create `.env.production` with mixed content:

```bash
# Public variables (not sensitive)
NODE_ENV=production
LOG_LEVEL=info

# Sensitive variables (will be encrypted)
#/encrypt
DATABASE_URL=postgres://user:pass@host/db
AWS_SECRET_ACCESS_KEY=supersecret
```

### Environment Variable Expansion

```bash
# .env.production
BASE_URL=https://api.example.com
API_ENDPOINT=${BASE_URL}/v1

# dotenvx automatically expands ${BASE_URL}
```

### Override with Local .env

```bash
# Team: Use encrypted .env.production
dotenvx run -f .env.production -- node app.js

# Developer: Override with local .env
dotenvx run -f .env.production -f .env -- node app.js
```

## Migration Guide

### From dotenv to dotenvx

**Step 1: Install dotenvx**

```bash
npm install --save-dev @dotenvx/dotenvx
```

**Step 2: Update code** (optional, backward compatible)

```javascript
// Old (dotenv)
require("dotenv").config({ path: ".env.production" });

// New (dotenvx) - No code change needed!
// Just run: dotenvx run -f .env.production -- node app.js
```

**Step 3: Encrypt existing .env files**

```bash
dotenvx encrypt -f .env.production
dotenvx encrypt -f .env.staging
```

**Step 4: Update .gitignore**

```gitignore
.env
.env.*
!.env.test
!.env.*.example
.env.keys
.env.vault
```

**Step 5: Update scripts**

```json
{
  "scripts": {
    "start": "dotenvx run -f .env.production -- node app.js",
    "dev": "dotenvx run -f .env -- node app.js"
  }
}
```

### From AWS Systems Manager Parameter Store

```bash
# 1. Export from SSM
aws ssm get-parameters-by-path \
  --path /myapp/production \
  --with-decryption \
  --query 'Parameters[*].[Name,Value]' \
  --output text | \
  awk '{print $1"="$2}' > .env.production

# 2. Encrypt with dotenvx
dotenvx encrypt -f .env.production

# 3. Commit encrypted file
git add .env.production
git commit -m "feat: migrate from SSM to dotenvx"
```

## Performance Considerations

### Startup Time

| Method              | Startup Time (cold) | Startup Time (warm) |
| ------------------- | ------------------- | ------------------- |
| Plain .env          | ~5ms                | ~2ms                |
| dotenvx (encrypted) | ~15ms               | ~8ms                |
| AWS SSM             | ~200ms              | ~150ms              |
| Vault               | ~100ms              | ~80ms               |

**Verdict**: dotenvx adds minimal overhead (~10ms) compared to remote secret managers.

### Memory Usage

- **Plain .env**: ~1MB
- **dotenvx**: ~2MB (includes crypto library)
- **Impact**: Negligible for most applications

### Caching

dotenvx automatically caches decrypted values in memory during `dotenvx run`:

```bash
# First load: decrypt from file (~15ms)
# Subsequent process.env reads: from cache (~0.1ms)
dotenvx run -f .env.production -- node app.js
```

## Security Deep Dive

### Threat Model

| Threat                           | Mitigation                                    |
| -------------------------------- | --------------------------------------------- |
| **Accidental commit of secrets** | Encryption + gitignore `.env.keys`            |
| **Repository leak**              | Encrypted files useless without keys          |
| **Man-in-the-middle**            | HTTPS for key distribution (1Password, Vault) |
| **Key theft**                    | Rotate keys, use hardware security modules    |
| **Insider threat**               | Audit logs, key rotation, least privilege     |

### Key Rotation

**When to rotate keys**:

- Every 90 days (compliance)
- After team member departure
- Suspected key compromise
- Security audit recommendation

**How to rotate**:

```bash
# 1. Decrypt with old key
dotenvx decrypt -f .env.production

# 2. Delete old key
rm .env.keys

# 3. Re-encrypt (generates new key)
dotenvx encrypt -f .env.production

# 4. Distribute new key via secure channel
# (1Password, Vault, etc.)
```

### Compliance

dotenvx meets requirements for:

- **SOC 2**: Encrypted storage, access controls
- **HIPAA**: 256-bit encryption, audit logs
- **PCI DSS**: Secure key management
- **GDPR**: Data encryption at rest

### Audit Logging

Enable audit logs for key access:

```bash
# Enable dotenvx audit mode
export DOTENVX_AUDIT=true

# Logs to: ~/.dotenvx/audit.log
dotenvx run -f .env.production -- node app.js

# View audit log
cat ~/.dotenvx/audit.log
# [2026-01-06T12:00:00Z] DECRYPT .env.production SUCCESS user=alice
```

## Troubleshooting

### Debug Mode

```bash
# Enable debug output
export DOTENVX_DEBUG=true
dotenvx run -f .env.production -- node app.js

# Output:
# [dotenvx] Loading .env.production
# [dotenvx] Decrypting 15 variables
# [dotenvx] Injecting environment variables
# [dotenvx] Running: node app.js
```

### Verify Encryption

```bash
# Check if file is encrypted
head -n 1 .env.production
# Expected: #/-------------------[DOTENV_PUBLIC_KEY]--------------------/

# Check encryption algorithm
dotenvx info -f .env.production
# Output:
# File: .env.production
# Encrypted: Yes
# Algorithm: AES-256-GCM
# Variables: 15
```

### Key Mismatch

```bash
# Error: "Failed to decrypt"
# Solution: Verify key matches file

# Get public key from encrypted file
dotenvx get-public-key -f .env.production

# Compare with key in .env.keys
cat .env.keys | grep PRODUCTION
```

## Best Practices Summary

1. ✅ **Always encrypt production secrets**
2. ✅ **Use separate keys per environment**
3. ✅ **Store `.env.keys` in 1Password/Vault**
4. ✅ **Add `.env.keys` to .gitignore**
5. ✅ **Rotate keys every 90 days**
6. ✅ **Use CI/CD secrets for keys**
7. ✅ **Audit key access**
8. ✅ **Keep dotenvx updated**

## Additional Resources

- [Official Documentation](https://dotenvx.com/docs)
- [GitHub Repository](https://github.com/dotenvx/dotenvx)
- [Security Advisories](https://github.com/dotenvx/dotenvx/security)
- [Community Discord](https://discord.gg/dotenvx)
