# Context7 Integration - Quick Reference

## Purpose

This skill now delegates generic Chrome Extension documentation to Context7 MCP, focusing on project-specific policies and React 19 + esbuild stack guidance.

## When to Use Context7 vs. This Skill

### Use Context7 For (Generic Documentation)

- Manifest V3 API documentation
- chrome.\* API methods and signatures
- Standard messaging patterns
- Permission types and their meanings
- Generic MV3 architecture
- Standard CSP rules

### Use This Skill For (Project-Specific)

- React 19 + TypeScript 5.9 patterns
- esbuild configuration
- Biome (ultracite) standards
- Security enforcement policies
- Performance budgets
- Web Store submission checklist
- Testing strategy (Vitest/Playwright/Storybook)

## Context7 Libraries

### Primary Library

`/websites/developer_chrome_extensions`

- 6849 code snippets
- High reputation
- Comprehensive Chrome Extension docs
- Best for: General patterns, tutorials, guides

### API Reference

`/websites/developer_chrome_extensions_reference_api`

- 9938 code snippets
- High reputation
- Complete chrome.\* API documentation
- Best for: Specific API methods, parameters, return types

### Manifest Reference

`/websites/developer_chrome_extensions_reference_manifest`

- 9533 code snippets
- High reputation
- manifest.json schema and validation
- Best for: Configuration options, permission declarations

## Common Query Patterns

### Service Worker Setup

```
Query: "Manifest V3 service worker background script setup chrome.runtime.onInstalled"
Library: /websites/developer_chrome_extensions
```

### Messaging Between Components

```
Query: "chrome.runtime.sendMessage content script to background service worker with response"
Library: /websites/developer_chrome_extensions
```

### Storage API

```
Query: "chrome.storage.local.get chrome.storage.local.set error handling promise"
Library: /websites/developer_chrome_extensions_reference_api
```

### Content Scripts Injection

```
Query: "content_scripts manifest.json matches run_at document_idle world ISOLATED"
Library: /websites/developer_chrome_extensions_reference_manifest
```

### Permissions Declaration

```
Query: "manifest.json permissions host_permissions activeTab storage declarativeNetRequest"
Library: /websites/developer_chrome_extensions_reference_manifest
```

### Tabs API

```
Query: "chrome.tabs.query chrome.tabs.sendMessage active tab current window"
Library: /websites/developer_chrome_extensions_reference_api
```

### Alarms API

```
Query: "chrome.alarms.create periodic alarm delayInMinutes periodInMinutes"
Library: /websites/developer_chrome_extensions_reference_api
```

### Web Request API (Declarative Net Request)

```
Query: "declarativeNetRequest rules redirect block modifyHeaders manifest"
Library: /websites/developer_chrome_extensions_reference_api
```

## Query Best Practices

### 1. Be Specific

❌ Bad: "chrome storage"
✅ Good: "chrome.storage.local API set get remove error handling"

### 2. Include Context

❌ Bad: "messaging"
✅ Good: "chrome.runtime.sendMessage content script to service worker response callback"

### 3. Mention Manifest V3

❌ Bad: "background script"
✅ Good: "Manifest V3 service worker background script persistent false"

### 4. Include Error Handling Keywords

❌ Bad: "tabs API"
✅ Good: "chrome.tabs.query active tab error handling promise try catch"

### 5. Specify Configuration Context

❌ Bad: "permissions"
✅ Good: "manifest.json permissions host_permissions difference Manifest V3"

## Integration Workflow

### 1. Initial Research

1. Read this skill for project-specific policies
2. Query Context7 for generic Chrome Extension documentation
3. Apply project-specific constraints from this skill

### 2. Implementation

1. Use Context7 for API signatures and examples
2. Apply TypeScript types from @types/chrome
3. Follow React 19 patterns from this skill
4. Enforce security policies from this skill

### 3. Validation

1. Use scripts/ for manifest validation
2. Check references/ for detailed policies
3. Verify against Web Store checklist (Section 7)

## Example: Implementing Message Passing

### Step 1: Query Context7

```
Query: "chrome.runtime.sendMessage content script to service worker async await promise"
Library: /websites/developer_chrome_extensions
```

### Step 2: Apply Project-Specific Patterns

```typescript
// shared/rpc.ts - Type-safe message schema (from this skill)
export interface GetUserDataRequest {
  type: "GET_USER_DATA";
}

export interface GetUserDataResponse {
  username: string;
  email: string;
}

// content/main.ts - Content script
async function getUserData(): Promise<GetUserDataResponse> {
  try {
    const response = await chrome.runtime.sendMessage<
      GetUserDataRequest,
      GetUserDataResponse
    >({
      type: "GET_USER_DATA",
    });
    return response;
  } catch (error) {
    console.error("Failed to get user data:", error);
    throw new Error("Failed to fetch user data");
  }
}

// background/service-worker.ts - Service worker
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "GET_USER_DATA") {
    // Async handler pattern
    (async () => {
      try {
        const userData = await fetchUserData();
        sendResponse(userData);
      } catch (error) {
        console.error("Error fetching user data:", error);
        sendResponse({ error: "Internal error" });
      }
    })();
    return true; // Keep message channel open for async response
  }
});
```

### Step 3: Verify Against Policies

- ✅ Type safety: Using shared types from `shared/rpc.ts`
- ✅ Error handling: Try-catch blocks with logging
- ✅ Async patterns: async/await instead of callbacks
- ✅ Component responsibilities: Content script requests, Service Worker responds
- ✅ Documentation: JSDoc comments for public APIs

## Troubleshooting

### Context7 Returns Outdated Information

- Try more specific query with "Manifest V3" keyword
- Check multiple libraries (primary vs. API reference)
- Verify against this skill's security policies

### Context7 Returns No Results

- Broaden query (remove specific version numbers)
- Try different library (API reference vs. primary)
- Check for typos in chrome.\* API names

### Context7 Returns Too Many Results

- Add more context keywords
- Specify exact API name (e.g., "chrome.storage.local" not "storage")
- Include use case context (e.g., "error handling", "async await")

## Maintenance

### When to Update This Skill

- React version changes (currently 19)
- TypeScript version changes (currently 5.9)
- Build tool changes (currently esbuild)
- Linter changes (currently Biome via ultracite)
- Project-specific security policies change
- Performance budgets change

### When NOT to Update This Skill

- Chrome Extension API changes (delegated to Context7)
- Manifest V3 specification changes (delegated to Context7)
- Generic messaging pattern changes (delegated to Context7)
- Standard permission types added (delegated to Context7)

## Feedback Loop

If you find:

1. **Generic documentation in this skill** → Move to Context7 query examples
2. **Project-specific patterns missing** → Add to this skill
3. **Context7 queries not working** → Update query examples section
4. **Security policies outdated** → Update Section 3 of this skill

---

**Last Updated**: 2026-01-15
**Context7 Libraries Verified**: 2026-01-15
