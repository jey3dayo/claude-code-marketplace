---
name: chrome-extension-best-practices
description: |
  [What] Chrome Extension (Manifest V3) development expert for secure, performant, and Web Store policy-compliant implementations. Specializes in security review, architecture validation, messaging patterns, and performance optimization for React/TypeScript/esbuild stack
  [When] Use when: users work with manifest.json, chrome.* APIs, content/background scripts, or request security/architecture reviews
  [Keywords] chrome extension best practices, Chrome, Extension, Manifest, development, expert, for
---

# Chrome Extension Best Practices (Manifest V3)

## 1. Role and Purpose

Serve as a Chrome Extension (Manifest V3) expert to implement secure, fast, and review-compliant extensions. This skill focuses on **project-specific policies** and **stack-specific guidance**, delegating generic Chrome Extension documentation to Context7 MCP.

### Technology Stack (Project-Specific)

- **Runtime**: React 19 / TypeScript 5.9
- **Bundler**: esbuild
- **Lint/Format**: Biome (via ultracite)
- **Test**: Vitest / Playwright
- **UI**: Storybook (+ Chromatic)
- **Additional**: date-fns, @types/chrome

## 2. Context7 Integration

For generic Chrome Extension documentation, use Context7 MCP instead of maintaining internal documentation.

### Available Libraries

1. **Primary**: `/websites/developer_chrome_extensions` (6849 snippets, High reputation)
   - Comprehensive Chrome Extension documentation
   - Manifest V3 migration guides
   - Architecture patterns

2. **API Reference**: `/websites/developer_chrome_extensions_reference_api` (9938 snippets)
   - Complete chrome.\* API documentation
   - Method signatures and examples

3. **Manifest Reference**: `/websites/developer_chrome_extensions_reference_manifest` (9533 snippets)
   - manifest.json schema and validation
   - MV3 configuration options

### Query Examples

**Manifest V3 Basics**:

```
Query: "Manifest V3 service worker configuration background script setup"
Library: /websites/developer_chrome_extensions
```

**Messaging Patterns**:

```
Query: "chrome.runtime.sendMessage content script to service worker communication"
Library: /websites/developer_chrome_extensions
```

**API Usage**:

```
Query: "chrome.storage.local API usage examples error handling"
Library: /websites/developer_chrome_extensions_reference_api
```

**Permission Configuration**:

```
Query: "manifest.json permissions host_permissions activeTab declarativeNetRequest"
Library: /websites/developer_chrome_extensions_reference_manifest
```

## 3. Project-Specific Enforcement Policies

### 3.1 Security Policies (Absolute)

#### Least Privilege (CRITICAL)

- Minimize `permissions` and `host_permissions` in manifest.json
- Avoid wildcards unless absolutely necessary
- **Enforcement**: Review every permission with "Why is this necessary?" test

#### MV3 CSP and "No Remote Code" Compliance (CRITICAL)

- Prohibit loading external JavaScript
- Prohibit `eval` equivalents and dynamic code generation
- MV3 enforces strict Content Security Policy constraints
- **Enforcement**: Zero tolerance for CSP violations

#### Data Handling: Transparency and Minimization (CRITICAL)

- Collect minimum necessary data
- Document purpose for every data collection point
- Comply with Web Store policies (personal information, tracking, advertising)
- **Enforcement**: Require documentation before implementation

#### Content Scripts: "Isolated World" Design (CRITICAL)

- Content scripts cannot share variables with page JavaScript
- Explicit communication via messaging or DOM manipulation only
- **Enforcement**: Flag any attempt to bypass isolated world boundary

### 3.2 Architecture Requirements (React 19 + esbuild)

#### Directory Structure (REQUIRED)

```
src/
  background/        # service worker
  content/           # content scripts
  pages/
    popup/
    options/
  shared/            # types, utilities, RPC definitions
  ui/                # React components (base-ui etc.)
tests/
  unit/
  e2e/
```

#### Type Safety (REQUIRED)

- Centralize message schema (request/response) in `shared/rpc.ts`
- Share types across CS/SW/UI
- Create thin wrapper around chrome APIs (from `@types/chrome`)
- Promisify callbacks for async/await patterns

#### esbuild Configuration (REQUIRED)

- Separate entries for SW/CS/popup/options
- **CRITICAL**: Fix output filenames to match manifest.json references
  - `service_worker`
  - `content_scripts[].js`
  - `action.default_popup`
- Prevent accidental filename mismatches

### 3.3 Component Responsibilities (REQUIRED)

- **Service Worker (background)**:
  - Permission-required operations
  - Event handlers
  - Centralized logging
  - State transitions
  - **NEVER**: DOM access

- **Content Script**:
  - DOM access/modification
  - Page information extraction (minimal scope)
  - **NEVER**: Permission APIs

- **Extension Pages (popup/options)**:
  - UI and user settings
  - **NEVER**: Direct DOM manipulation of web pages

- **Storage**:
  - Store critical state in `chrome.storage.*` (Service Worker can stop/restart)
  - Implement cache TTL and size limits
  - **Encryption requirement**: Sensitive data must be encrypted with documented key management

## 4. Testing Strategy (Stack-Specific)

### Test Layers (REQUIRED)

1. **Vitest** (Unit Tests)
   - Test shared logic, RPC, parsers, state transitions
   - Mock chrome APIs using `@types/chrome`
   - Target coverage: 80%+ for shared logic

2. **Playwright** (E2E Tests)
   - Install in real browser
   - Verify page operations
   - Test extension UI / CS behavior
   - **CRITICAL**: Test permission flows and error states

3. **Storybook** (Component Isolation)
   - Isolate popup/options UI
   - Basic accessibility checks with addon
   - Visual regression testing with Chromatic

## 5. Code Quality Standards (Biome + TypeScript)

### TypeScript Configuration (REQUIRED)

```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### Biome Configuration (via ultracite)

- Follow ultracite preset
- JSDoc style comments for public APIs
- async/await preferred over Promise chains

### Error Handling (REQUIRED)

```typescript
/**
 * Safe wrapper for chrome.storage.local.get
 * @param {string} key - Storage key
 * @returns {Promise<T>} - Stored value or default
 */
async function getStorageValue<T>(key: string, defaultValue: T): Promise<T> {
  try {
    const result = await chrome.storage.local.get(key)
    return result[key] ?? defaultValue
  } catch (error) {
    console.error(`Failed to get storage value for ${key}:`, error)
    return defaultValue
  }
}
```

## 6. Performance Requirements

### Content Scripts (CRITICAL)

- Minimal and shortest execution time
- Delegate heavy processing to Service Worker
- **Budget**: < 50ms initialization time

### DOM Monitoring (REQUIRED)

- Avoid MutationObserver abuse
- Apply conditions, throttling, cleanup
- **Budget**: < 10ms per mutation batch

### matches Configuration (REQUIRED)

- Limit to necessary pages to reduce injection frequency
- Use specific URL patterns instead of `<all_urls>`

### Cache Strategy (REQUIRED)

- Implement TTL for all cached data
- Implement invalidation mechanisms
- **Max cache size**: 5MB per extension component

## 7. Web Store Submission Checklist

### Pre-Submission (REQUIRED)

- [ ] Document collected data and purposes
- [ ] Document third-party data sharing
- [ ] Provide explanations for each permission (review-ready)
- [ ] Ensure screenshots and descriptions match actual behavior
- [ ] Exclude PII from exception logs
- [ ] Verify no tracking/obfuscation/excessive permissions

### Privacy Policy (REQUIRED)

- Use template: `assets/privacy-policy-template.md`
- Customize for actual data collection
- Host publicly before submission

## 8. Claude Code Output Guidelines

### Change Proposal Format (REQUIRED)

Present changes in order:

1. Design approach (security/performance impact)
2. Diff (with file paths and line numbers)
3. Test considerations (required tests)

### MV3 Enforcement (REQUIRED)

Always flag:

- CSP violations
- Least privilege violations
- Policy compliance risks
- Responsibility separation violations

### Testing Output (REQUIRED)

- Provide Vitest unit tests for shared logic
- Provide Playwright E2E tests for critical flows
- Document test setup and mocks

## 9. Validation Tools

### Available Scripts (scripts/)

- **manifest-validator.ts**: Verify manifest.json syntax and MV3 compliance
- **permission-analyzer.ts**: Analyze API usage vs permission consistency

### Usage

```bash
# Validate manifest
tsx scripts/manifest-validator.ts

# Analyze permissions
tsx scripts/permission-analyzer.ts
```

## 10. Reference Documentation (references/)

For project-specific detailed guides:

- **mv3-migration-checklist.md**: MV2→MV3 migration checklist
- **web-store-policy.md**: Web Store policy summary and review perspectives
- **security-patterns.md**: Concrete XSS/CSP/permission code examples
- **coding-standards.md**: Detailed coding standards (supplementary to Biome)
- **asset-management.md**: Icon/image update procedures

**Note**: For generic Chrome Extension documentation, use Context7 MCP with libraries listed in Section 2.

## 11. Trigger Conditions

Automatically activate this skill when:

- User mentions: "Chrome extension security review", "Manifest V3 compliance check", "Content Script responsibility separation", "Web Store submission check"
- Editing: manifest.json, chrome.\* API usage, content/background script implementation, permissions/host_permissions changes
- User requests: architecture review, messaging pattern validation, performance optimization

---

## Integration Notes

### Context7 Delegation Strategy

1. **Generic Documentation** → Context7 MCP
   - Manifest V3 basics
   - chrome.\* API documentation
   - Standard messaging patterns
   - Permission explanations

2. **Project-Specific** → This Skill
   - React 19 + TypeScript 5.9 patterns
   - esbuild configuration
   - Biome (ultracite) standards
   - Stack-specific testing
   - Security enforcement policies
   - Performance budgets

### Progressive Disclosure Pattern

- Load this skill for project-specific policies
- Query Context7 on-demand for API documentation
- Maintain separation: policies (skill) vs. documentation (Context7)
