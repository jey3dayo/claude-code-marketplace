---
name: security
description: |
  [What] Specialized skill for conducting security-focused code reviews. Evaluates OWASP Top 10 compliance, input validation, authentication/authorization, data protection, and secure coding practices. Provides comprehensive security assessment with risk levels and remediation guidance
  [When] Use when: users mention "security", "OWASP", "security review", "vulnerability", or discuss security concerns
  [Keywords] security, OWASP, security review, vulnerability
---

# Security-Focused Code Review

## Overview

This skill provides comprehensive security review guidance based on OWASP Top 10 and security best practices. Evaluate code for vulnerabilities, proper input validation, authentication/authorization implementation, data protection, and secure coding patterns. Identify security risks and provide actionable remediation steps.

## Core Evaluation Areas

### 1. Input Validation and Sanitization

Assess protection against injection attacks:

#### Input Validation

- Validate all external inputs
- Adopt whitelist approach
- Use appropriate validation libraries

#### SQL Injection Prevention

- Use parameterized queries
- Proper ORM usage
- Avoid dynamic SQL construction

#### XSS Prevention

- Output escaping
- Content Security Policy implementation
- Proper innerHTML usage

#### Command Injection Prevention

- Avoid external command execution
- Strict input validation
- Utilize sandboxed environments

**SQL Injection Example**:

```javascript
// Bad: Vulnerable to SQL injection
const query = `SELECT * FROM users WHERE id = ${userId}`
db.query(query)

// Good: Parameterized query
const query = 'SELECT * FROM users WHERE id = ?'
db.query(query, [userId])
```

**XSS Prevention Example**:

```jsx
// Bad: XSS vulnerable
<div dangerouslySetInnerHTML={{__html: userInput}} />

// Good: Safe rendering
<div>{escapeHtml(userInput)}</div>

// Or with proper sanitization
<div dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(userInput)}} />
```

### 2. Authentication and Authorization

Review authentication mechanisms and access control:

#### Authentication Mechanisms

- Strong password policies
- Multi-factor authentication implementation
- Proper session management

#### Authorization Control

- Principle of least privilege
- Role-based access control
- Consistent authorization checks

#### Session Management

- Secure session generation
- Session fixation attack prevention
- Proper session invalidation

**Token Management Example**:

```javascript
// Bad: Insecure storage
localStorage.setItem('token', authToken)

// Good: HttpOnly Cookie
document.cookie = `token=${authToken}; HttpOnly; Secure; SameSite=Strict`
```

### 3. Data Protection

Evaluate data security measures:

#### Encryption

- Data-at-rest encryption
- Data-in-transit encryption (HTTPS)
- Strong cryptographic algorithms

#### Sensitive Information Handling

- Password hashing (bcrypt, argon2)
- API key management
- Prevent secrets in logs

#### Privacy Protection

- GDPR/CCPA compliance
- Data minimization principle
- Consent management

### 4. Error Handling and Logging

Review information disclosure prevention:

#### Error Information Control

- Prevent information leakage to attackers
- Appropriate error messages
- Remove debug info from production

#### Security Logging

- Log authentication attempts
- Detect abnormal access patterns
- Prevent log tampering

### 5. Configuration and Infrastructure

Assess security headers and dependency management:

#### Security Headers

- HSTS implementation
- X-Frame-Options configuration
- X-Content-Type-Options settings

**Security Headers Example**:

```javascript
// Express.js example
app.use(
  helmet({
    hsts: { maxAge: 31536000 },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
      },
    },
  })
)
```

#### Dependency Management

- Identify vulnerable dependencies
- Regular security updates
- Supply chain attack prevention

## Security Risk Levels

### 🔴 Critical (Immediate Action Required)

Issues that could lead to complete system compromise:

- SQL Injection vulnerabilities
- XSS vulnerabilities
- Authentication bypass
- Privilege escalation
- Sensitive data in plaintext
- Command injection

**Action**: Stop deployment, fix immediately

### 🟡 High (Fix Before Release)

Issues that could lead to significant security impact:

- Information disclosure
- CSRF vulnerabilities
- Improper error handling
- Session management flaws

**Action**: Fix before next release

### 🟢 Medium (Schedule Fix)

Issues that reduce security posture:

- Missing security headers
- Outdated dependencies
- Insufficient logging

**Action**: Include in upcoming sprint

### 🔵 Low (Best Practice)

Improvements for defense in depth:

- Enhanced monitoring
- Additional validation
- Security documentation

**Action**: Technical debt backlog

## OWASP Top 10 Assessment

Evaluate compliance with OWASP Top 10:

### A01: Broken Access Control

- [ ] Authorization checks on all sensitive operations
- [ ] Principle of least privilege enforced
- [ ] No insecure direct object references

### A02: Cryptographic Failures

- [ ] Strong encryption algorithms used
- [ ] Sensitive data encrypted at rest
- [ ] TLS/HTTPS enforced

### A03: Injection

- [ ] All inputs validated
- [ ] Parameterized queries used
- [ ] Output properly escaped

### A04: Insecure Design

- [ ] Threat modeling performed
- [ ] Security requirements defined
- [ ] Secure design patterns applied

### A05: Security Misconfiguration

- [ ] Security headers configured
- [ ] Default credentials changed
- [ ] Unnecessary features disabled

### A06: Vulnerable Components

- [ ] Dependencies regularly updated
- [ ] Known vulnerabilities addressed
- [ ] Component inventory maintained

### A07: Authentication Failures

- [ ] Multi-factor authentication available
- [ ] Password complexity enforced
- [ ] Session management secure

### A08: Software and Data Integrity

- [ ] Code signing implemented
- [ ] CI/CD pipeline secured
- [ ] Dependency integrity verified

### A09: Security Logging Failures

- [ ] Security events logged
- [ ] Log tampering prevented
- [ ] Monitoring and alerting configured

### A10: Server-Side Request Forgery (SSRF)

- [ ] URL validation implemented
- [ ] Allowlist for external requests
- [ ] Network segmentation enforced

## Security Evaluation Guidelines

### OWASP Top 10 Compliance

**⭐⭐⭐⭐⭐ (5/5) Excellent**:

- Complete OWASP Top 10 coverage
- No known vulnerabilities
- Comprehensive security controls
- Regular security testing

**⭐⭐⭐⭐☆ (4/5) Good**:

- Good OWASP coverage
- Minor issues present
- Strong security controls
- Periodic security reviews

**⭐⭐⭐☆☆ (3/5) Standard**:

- Basic OWASP coverage
- Several security gaps
- Adequate controls
- Improvements needed

**⭐⭐☆☆☆ (2/5) Needs Improvement**:

- Incomplete OWASP coverage
- Multiple vulnerabilities
- Weak security controls
- Urgent fixes required

**⭐☆☆☆☆ (1/5) Critical Issues**:

- Major security vulnerabilities
- Minimal security controls
- Immediate action required
- High risk of compromise

## Review Workflow

When conducting security reviews:

1. **Scan for critical issues**: Identify immediate threats
2. **Check input validation**: Review all data entry points
3. **Verify authentication**: Assess authentication mechanisms
4. **Test authorization**: Check access controls
5. **Review data protection**: Verify encryption and secrets management
6. **Examine error handling**: Ensure no information leakage
7. **Check dependencies**: Scan for known vulnerabilities
8. **Verify security headers**: Ensure proper configuration
9. **Assess logging**: Review security event logging
10. **Provide risk assessment**: Categorize and prioritize findings

## 🤖 Agent Integration

このスキルはセキュリティ関連タスクを実行するエージェントに専門知識を提供します:

### Code-Reviewer Agent

- **提供内容**: OWASP Top 10準拠評価、脆弱性検出、セキュアコーディング評価
- **タイミング**: セキュリティレビュー時
- **コンテキスト**:
  - ⭐️5段階評価（入力検証、認証/認可、データ保護、セキュアコーディング）
  - 脆弱性リスクレベル評価（Critical, High, Medium, Low）
  - 修正優先度付け
  - OWASP Top 10マッピング

### Orchestrator Agent

- **提供内容**: セキュリティ機能実装戦略、認証/認可システム設計
- **タイミング**: セキュリティ機能実装時
- **コンテキスト**:
  - 認証実装パターン（JWT, OAuth2, session）
  - 入力検証フレームワーク統合
  - 暗号化実装（bcrypt, crypto API）
  - CSRFトークン、セキュリティヘッダー実装

### Error-Fixer Agent

- **提供内容**: セキュリティ脆弱性修正、入力検証実装
- **タイミング**: セキュリティ問題修正時
- **コンテキスト**: SQLインジェクション修正、XSS対策、CSRF対策、機密情報漏洩防止

### 自動ロード条件

- "security"、"OWASP"、"脆弱性"、"セキュリティ"に言及
- 認証/認可機能実装時
- セキュリティレビュー要求時
- `/review`コマンドでAPI/Backend/Fullstackプロジェクト検出時

**統合例**:

```
ユーザー: "認証システムのセキュリティ問題を修正"
    ↓
TaskContext作成
    ↓
プロジェクト検出: API Backend
    ↓
スキル自動ロード: security, golang (or typescript)
    ↓
エージェント選択: code-reviewer → error-fixer
    ↓ (スキルコンテキスト提供)
OWASP Top 10チェック + 技術固有セキュリティパターン
    ↓
実行完了（脆弱性修正、セキュアコーディング適用）
```

## Integration with Related Skills

- **golang skill**: For Go-specific security patterns
- **typescript skill**: For type-safe security implementations
- **react skill**: For frontend security (XSS, CSRF)
- **clean-architecture skill**: For secure architectural design

## 詳細リファレンス

- `references/index.md`
