# Manifest V3 Migration Checklist

Complete guide for migrating Chrome Extensions from Manifest V2 to V3.

## 1. Manifest File Changes

### 1.1 manifest_version

```json
// Before (V2)
{
  "manifest_version": 2
}

// After (V3)
{
  "manifest_version": 3
}
```

### 1.2 background → service_worker

```json
// Before (V2)
{
  "background": {
    "scripts": ["background.js"],
    "persistent": false
  }
}

// After (V3)
{
  "background": {
    "service_worker": "background.js"
  }
}
```

**Important**: Service Workers cannot use DOM APIs or window object. Use offscreen documents for DOM operations.

### 1.3 browser_action/page_action → action

```json
// Before (V2)
{
  "browser_action": {
    "default_popup": "popup.html",
    "default_icon": "icon.png"
  }
}

// After (V3)
{
  "action": {
    "default_popup": "popup.html",
    "default_icon": "icon.png"
  }
}
```

### 1.4 permissions → host_permissions

```json
// Before (V2)
{
  "permissions": [
    "tabs",
    "storage",
    "https://example.com/*"
  ]
}

// After (V3)
{
  "permissions": [
    "tabs",
    "storage"
  ],
  "host_permissions": [
    "https://example.com/*"
  ]
}
```

**Best Practice**: Separate API permissions from host permissions. Use minimal necessary scopes.

### 1.5 web_accessible_resources

```json
// Before (V2)
{
  "web_accessible_resources": [
    "images/*",
    "styles/content.css"
  ]
}

// After (V3)
{
  "web_accessible_resources": [
    {
      "resources": ["images/*", "styles/content.css"],
      "matches": ["https://example.com/*"]
    }
  ]
}
```

## 2. Code Changes

### 2.1 Background Script → Service Worker

**Before (V2)**:

```javascript
// background.js
chrome.browserAction.onClicked.addListener(tab => {
  chrome.tabs.executeScript(tab.id, {
    file: 'content.js',
  })
})
```

**After (V3)**:

```javascript
// background.js (service worker)
chrome.action.onClicked.addListener(tab => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['content.js'],
  })
})
```

### 2.2 Content Security Policy (CSP)

**V3 Restrictions**:

- No inline scripts allowed
- No `eval()` or `new Function()`
- No remote code execution
- Strict CSP: `script-src 'self'`

**Migration Strategy**:

```javascript
// Before (V2) - UNSAFE
const code = `alert('Hello')`
eval(code)

// After (V3) - Use declarative approaches
chrome.scripting.executeScript({
  target: { tabId: tab.id },
  func: () => {
    alert('Hello')
  },
})
```

### 2.3 Callback → Promise/async-await

**Before (V2)**:

```javascript
chrome.tabs.query({ active: true }, tabs => {
  const tab = tabs[0]
  chrome.tabs.sendMessage(tab.id, { type: 'greeting' }, response => {
    console.log(response)
  })
})
```

**After (V3)**:

```typescript
// Promisified approach
async function sendGreeting() {
  const [tab] = await chrome.tabs.query({ active: true })
  const response = await chrome.tabs.sendMessage(tab.id, { type: 'greeting' })
  console.log(response)
}
```

### 2.4 XMLHttpRequest → fetch

**Before (V2)**:

```javascript
const xhr = new XMLHttpRequest()
xhr.open('GET', 'https://api.example.com/data')
xhr.onload = () => {
  console.log(xhr.responseText)
}
xhr.send()
```

**After (V3)**:

```typescript
async function fetchData() {
  const response = await fetch('https://api.example.com/data')
  const data = await response.json()
  console.log(data)
}
```

## 3. API Changes

### 3.1 Removed/Deprecated APIs

| V2 API                         | V3 Replacement                   |
| ------------------------------ | -------------------------------- |
| `chrome.browserAction`         | `chrome.action`                  |
| `chrome.pageAction`            | `chrome.action`                  |
| `chrome.tabs.executeScript`    | `chrome.scripting.executeScript` |
| `chrome.tabs.insertCSS`        | `chrome.scripting.insertCSS`     |
| `chrome.extension.sendRequest` | `chrome.runtime.sendMessage`     |

### 3.2 New Permissions Required

| Operation                           | Required Permission       |
| ----------------------------------- | ------------------------- |
| `chrome.scripting.executeScript`    | `"scripting"`             |
| `chrome.scripting.insertCSS`        | `"scripting"`             |
| Dynamic content script registration | `"scripting"`             |
| `chrome.tabs.query`                 | `"tabs"` (for URL access) |

## 4. Storage Considerations

### 4.1 Service Worker Lifecycle

**Problem**: Service Workers are short-lived and can be terminated at any time.

**Solution**: Store state in `chrome.storage` instead of global variables.

```typescript
// Before (V2) - UNSAFE in V3
let userSettings = {}

chrome.runtime.onMessage.addListener(message => {
  if (message.type === 'saveSettings') {
    userSettings = message.settings
  }
})

// After (V3) - SAFE
chrome.runtime.onMessage.addListener(async message => {
  if (message.type === 'saveSettings') {
    await chrome.storage.local.set({ userSettings: message.settings })
  }
})
```

### 4.2 Cache Management

Implement TTL and size limits:

```typescript
interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number // milliseconds
}

async function getCachedData<T>(key: string): Promise<T | null> {
  const result = await chrome.storage.local.get(key)
  const entry: CacheEntry<T> | undefined = result[key]

  if (!entry) return null

  const now = Date.now()
  if (now - entry.timestamp > entry.ttl) {
    await chrome.storage.local.remove(key)
    return null
  }

  return entry.data
}

async function setCachedData<T>(key: string, data: T, ttl: number = 3600000) {
  const entry: CacheEntry<T> = {
    data,
    timestamp: Date.now(),
    ttl,
  }
  await chrome.storage.local.set({ [key]: entry })
}
```

## 5. Testing Checklist

### 5.1 Functional Testing

- [ ] All background event handlers work correctly
- [ ] Content scripts inject successfully
- [ ] Messaging between components works
- [ ] Storage operations are persistent across SW restarts
- [ ] Extension icon and popup function properly

### 5.2 Performance Testing

- [ ] Service Worker doesn't cause excessive wake-ups
- [ ] Content scripts have minimal performance impact
- [ ] Storage operations are batched when possible
- [ ] No memory leaks in long-running operations

### 5.3 Security Testing

- [ ] No CSP violations in console
- [ ] Host permissions are minimal
- [ ] No eval() or unsafe code execution
- [ ] User data is properly validated and sanitized

## 6. Common Migration Issues

### 6.1 Issue: "Uncaught ReferenceError: window is not defined"

**Cause**: Service Workers don't have access to window/document.

**Solution**: Use offscreen documents or move logic to content scripts.

### 6.2 Issue: Service Worker terminates unexpectedly

**Cause**: V3 Service Workers are event-driven and short-lived.

**Solution**: Store state in chrome.storage, use persistent event listeners.

### 6.3 Issue: "Cannot access chrome.tabs.Tab.url"

**Cause**: Missing "tabs" permission in manifest.

**Solution**: Add `"tabs"` to permissions array.

```json
{
  "permissions": ["tabs"]
}
```

### 6.4 Issue: Content script injection fails

**Cause**: Changed API from `chrome.tabs.executeScript` to `chrome.scripting.executeScript`.

**Solution**: Update code and add "scripting" permission.

```typescript
// Add to manifest.json
{
  "permissions": ["scripting"]
}

// Update code
await chrome.scripting.executeScript({
  target: { tabId: tab.id },
  files: ['content.js']
});
```

## 7. Migration Timeline

### Phase 1: Preparation (1-2 days)

1. Read official migration guide
2. Review current extension architecture
3. Identify breaking changes
4. Plan migration strategy

### Phase 2: Manifest Updates (1 day)

1. Update manifest_version to 3
2. Convert background to service_worker
3. Separate host_permissions
4. Update web_accessible_resources format

### Phase 3: Code Migration (3-7 days)

1. Replace deprecated APIs
2. Convert callbacks to Promises/async-await
3. Refactor state management for SW lifecycle
4. Update CSP-violating code

### Phase 4: Testing (2-3 days)

1. Functional testing
2. Performance testing
3. Security testing
4. Cross-browser testing (if applicable)

### Phase 5: Deployment (1 day)

1. Update version in manifest
2. Prepare store listing updates
3. Submit for review
4. Monitor for issues

## 8. Resources

### Official Documentation

- [Chrome Extension Manifest V3 Migration Guide](https://developer.chrome.com/docs/extensions/migrating/)
- [Manifest V3 Overview](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [Service Workers in Chrome Extensions](https://developer.chrome.com/docs/extensions/mv3/service_workers/)

### Tools

- [Extension Manifest Converter](https://developer.chrome.com/docs/extensions/mv3/mv3-migration-checklist/#converter)
- Chrome DevTools Extension Inspector

### Community

- [Chromium Extensions Google Group](https://groups.google.com/a/chromium.org/g/chromium-extensions)
- [Stack Overflow - google-chrome-extension tag](https://stackoverflow.com/questions/tagged/google-chrome-extension)
