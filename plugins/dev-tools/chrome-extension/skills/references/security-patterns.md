# Security Patterns: XSS, CSP, and Permissions

Concrete code examples and implementation patterns for secure Chrome Extension development.

## 1. XSS (Cross-Site Scripting) Prevention

### 1.1 Never Use innerHTML with User Input

**❌ UNSAFE**:

```typescript
// DANGEROUS: User input directly inserted into DOM
function displayUserName(name: string) {
  document.getElementById("user-name")!.innerHTML = name; // XSS vulnerability
}

displayUserName('<img src=x onerror=alert("XSS")>'); // Executes malicious code
```

**✅ SAFE**:

```typescript
// SAFE: Use textContent or createTextNode
function displayUserName(name: string) {
  document.getElementById("user-name")!.textContent = name; // Escaped automatically
}

displayUserName('<img src=x onerror=alert("XSS")>'); // Displayed as text
```

### 1.2 Sanitize HTML Content

When HTML rendering is necessary, use DOM APIs:

```typescript
/**
 * Create safe HTML elements from user content
 */
function createSafeElement(
  tag: string,
  textContent: string,
  className?: string,
): HTMLElement {
  const element = document.createElement(tag);
  element.textContent = textContent; // Auto-escaped
  if (className) {
    element.className = className;
  }
  return element;
}

// Usage
const container = document.getElementById("container")!;
container.appendChild(createSafeElement("div", userInput, "user-content"));
```

### 1.3 Escape HTML Utility

```typescript
/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Usage
const safeContent = escapeHtml('<script>alert("XSS")</script>');
console.log(safeContent); // &lt;script&gt;alert("XSS")&lt;/script&gt;
```

### 1.4 URL Validation

```typescript
/**
 * Validate and sanitize URLs
 */
function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    // Only allow http/https protocols
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * Create safe link element
 */
function createSafeLink(url: string, text: string): HTMLAnchorElement | null {
  if (!isSafeUrl(url)) {
    console.error("Invalid URL:", url);
    return null;
  }

  const link = document.createElement("a");
  link.href = url;
  link.textContent = text;
  link.rel = "noopener noreferrer"; // Security best practice
  link.target = "_blank";
  return link;
}

// Usage
const userUrl = 'javascript:alert("XSS")'; // Malicious
const link = createSafeLink(userUrl, "Click me"); // Returns null
```

### 1.5 Safe Data Attributes

```typescript
/**
 * Safely set data attributes
 */
function setSafeDataAttribute(
  element: HTMLElement,
  name: string,
  value: string,
): void {
  // data-* attributes are safe for storing data
  element.setAttribute(`data-${name}`, value);
}

// Usage
const button = document.createElement("button");
setSafeDataAttribute(button, "user-id", userInput);
```

## 2. Content Security Policy (CSP)

### 2.1 Manifest V3 Default CSP

```json
// manifest.json
{
  "manifest_version": 3
  // Default CSP (automatically applied):
  // script-src 'self'; object-src 'self'
}
```

### 2.2 Extension Pages CSP

For stricter CSP on extension pages:

```json
{
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self'"
  }
}
```

### 2.3 CSP-Compliant Dynamic Content

**❌ UNSAFE (CSP Violation)**:

```javascript
// PROHIBITED in MV3
element.innerHTML = "<script>doSomething()</script>";
eval("doSomething()");
new Function("doSomething()")();
```

**✅ SAFE**:

```typescript
// Use declarative approaches
function loadDynamicContent(data: unknown) {
  const container = document.getElementById("dynamic-content")!;

  // Clear previous content
  container.textContent = "";

  // Build DOM tree
  const heading = document.createElement("h2");
  heading.textContent = "Dynamic Content";
  container.appendChild(heading);

  // Add event listeners
  const button = document.createElement("button");
  button.textContent = "Click me";
  button.addEventListener("click", () => {
    console.log("Button clicked", data);
  });
  container.appendChild(button);
}
```

### 2.4 External Resources

**❌ PROHIBITED**:

```html
<!-- Cannot load external scripts in MV3 -->
<script src="https://cdn.example.com/library.js"></script>
```

**✅ ALLOWED**:

```json
// Bundle external libraries locally
{
  "web_accessible_resources": [
    {
      "resources": ["lib/external-library.js"],
      "matches": ["<all_urls>"]
    }
  ]
}
```

```html
<script src="/lib/external-library.js"></script>
```

### 2.5 Inline Styles (Alternative)

**Prefer**:

```typescript
// Use style property instead of style attribute
function setStyles(element: HTMLElement) {
  element.style.color = "#333";
  element.style.fontSize = "14px";
  element.style.padding = "10px";
}
```

**Or use CSS classes**:

```typescript
// Better: Use predefined CSS classes
element.className = "user-content theme-dark";
```

## 3. Permission Management

### 3.1 Minimal Permissions Pattern

```json
{
  "manifest_version": 3,
  "permissions": [
    "storage" // Only essential permissions
  ],
  "optional_permissions": [
    "tabs", // Request when needed
    "bookmarks"
  ],
  "host_permissions": [
    "https://specific-domain.com/*" // Narrow scope
  ]
}
```

### 3.2 Runtime Permission Request

```typescript
/**
 * Request optional permissions at runtime
 */
async function requestTabsPermission(): Promise<boolean> {
  try {
    const granted = await chrome.permissions.request({
      permissions: ["tabs"],
    });

    if (granted) {
      console.log("Tabs permission granted");
      return true;
    } else {
      console.log("Tabs permission denied");
      return false;
    }
  } catch (error) {
    console.error("Permission request failed:", error);
    return false;
  }
}

// Usage in popup
document.getElementById("enable-tabs")!.addEventListener("click", async () => {
  const granted = await requestTabsPermission();
  if (granted) {
    // Enable feature
  }
});
```

### 3.3 Check Permissions Before Use

```typescript
/**
 * Check if permission is granted
 */
async function hasPermission(permission: string): Promise<boolean> {
  return chrome.permissions.contains({
    permissions: [permission],
  });
}

/**
 * Use API only if permission granted
 */
async function getAllTabs() {
  if (await hasPermission("tabs")) {
    return chrome.tabs.query({});
  } else {
    console.warn("Tabs permission not granted");
    return [];
  }
}
```

### 3.4 Remove Unused Permissions

```typescript
/**
 * Remove permission when no longer needed
 */
async function removeTabsPermission(): Promise<boolean> {
  try {
    const removed = await chrome.permissions.remove({
      permissions: ["tabs"],
    });
    console.log("Tabs permission removed:", removed);
    return removed;
  } catch (error) {
    console.error("Failed to remove permission:", error);
    return false;
  }
}
```

### 3.5 Host Permission Patterns

```json
{
  "host_permissions": [
    // BEST: Specific domain and path
    "https://api.example.com/v1/*",

    // GOOD: Specific domain, all paths
    "https://example.com/*",

    // OK: Wildcard subdomain
    "https://*.example.com/*",

    // AVOID: All HTTPS sites
    "https://*/*",

    // LAST RESORT: All URLs (requires strong justification)
    "*://*/*"
  ]
}
```

## 4. Secure Messaging Patterns

### 4.1 Message Validation

```typescript
/**
 * Type-safe message schema
 */
type MessageType = "GET_DATA" | "SET_DATA" | "DELETE_DATA";

interface Message<T = unknown> {
  type: MessageType;
  payload: T;
}

/**
 * Validate message structure
 */
function isValidMessage(message: unknown): message is Message {
  if (typeof message !== "object" || message === null) {
    return false;
  }

  const msg = message as Record<string, unknown>;
  return (
    typeof msg.type === "string" &&
    ["GET_DATA", "SET_DATA", "DELETE_DATA"].includes(msg.type) &&
    "payload" in msg
  );
}

/**
 * Secure message handler
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Validate message
  if (!isValidMessage(message)) {
    console.error("Invalid message format:", message);
    sendResponse({ success: false, error: "Invalid message" });
    return;
  }

  // Validate sender (optional)
  if (!sender.id || sender.id !== chrome.runtime.id) {
    console.error("Message from unknown sender:", sender);
    sendResponse({ success: false, error: "Unauthorized" });
    return;
  }

  // Handle message
  handleMessage(message, sendResponse);
  return true; // Keep channel open for async response
});
```

### 4.2 Content Script to Background Messaging

```typescript
// content.ts
async function sendMessageToBackground<T>(
  type: MessageType,
  payload: unknown,
): Promise<T> {
  try {
    const message: Message = { type, payload };
    const response = await chrome.runtime.sendMessage(message);

    if (!response.success) {
      throw new Error(response.error || "Unknown error");
    }

    return response.data as T;
  } catch (error) {
    console.error("Message send failed:", error);
    throw error;
  }
}

// Usage
const data = await sendMessageToBackground<string[]>("GET_DATA", {
  key: "items",
});
```

### 4.3 Prevent Message Spoofing

```typescript
/**
 * Verify message sender
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Only accept messages from extension context
  if (sender.id !== chrome.runtime.id) {
    console.warn("Rejected message from external source");
    return;
  }

  // Only accept messages from specific URLs (if needed)
  if (sender.url && !sender.url.startsWith(chrome.runtime.getURL(""))) {
    console.warn("Rejected message from unauthorized URL");
    return;
  }

  // Process message
  handleMessage(message, sendResponse);
  return true;
});
```

## 5. Secure Storage Patterns

### 5.1 Data Validation Before Storage

```typescript
/**
 * Validate data before storing
 */
interface UserSettings {
  theme: "light" | "dark";
  language: string;
  notifications: boolean;
}

function isValidSettings(data: unknown): data is UserSettings {
  if (typeof data !== "object" || data === null) return false;

  const settings = data as Record<string, unknown>;
  return (
    (settings.theme === "light" || settings.theme === "dark") &&
    typeof settings.language === "string" &&
    typeof settings.notifications === "boolean"
  );
}

async function saveSettings(settings: unknown): Promise<void> {
  if (!isValidSettings(settings)) {
    throw new Error("Invalid settings format");
  }

  await chrome.storage.sync.set({ settings });
}
```

### 5.2 Encrypt Sensitive Data

```typescript
/**
 * Simple encryption utility (use Web Crypto API for production)
 */
async function encryptData(data: string, key: CryptoKey): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);

  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: crypto.getRandomValues(new Uint8Array(12)) },
    key,
    dataBuffer,
  );

  return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
}

async function decryptData(
  encryptedData: string,
  key: CryptoKey,
): Promise<string> {
  const dataBuffer = Uint8Array.from(atob(encryptedData), (c) =>
    c.charCodeAt(0),
  );

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: new Uint8Array(12) },
    key,
    dataBuffer,
  );

  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}

// Usage
const key = await crypto.subtle.generateKey(
  { name: "AES-GCM", length: 256 },
  true,
  ["encrypt", "decrypt"],
);

const encrypted = await encryptData("sensitive-data", key);
await chrome.storage.local.set({ encryptedToken: encrypted });
```

### 5.3 Storage Quota Management

```typescript
/**
 * Check storage quota
 */
async function getStorageInfo(): Promise<{
  used: number;
  quota: number;
  percentage: number;
}> {
  const bytesInUse = await chrome.storage.local.getBytesInUse();
  const quota = chrome.storage.local.QUOTA_BYTES;

  return {
    used: bytesInUse,
    quota,
    percentage: (bytesInUse / quota) * 100,
  };
}

/**
 * Clean old cache entries
 */
async function cleanOldCache(maxAge: number = 86400000): Promise<void> {
  const all = await chrome.storage.local.get();
  const now = Date.now();
  const toRemove: string[] = [];

  for (const [key, value] of Object.entries(all)) {
    if (typeof value === "object" && value !== null && "timestamp" in value) {
      const entry = value as { timestamp: number };
      if (now - entry.timestamp > maxAge) {
        toRemove.push(key);
      }
    }
  }

  if (toRemove.length > 0) {
    await chrome.storage.local.remove(toRemove);
    console.log(`Cleaned ${toRemove.length} old cache entries`);
  }
}
```

## 6. API Security Best Practices

### 6.1 Secure fetch Requests

```typescript
/**
 * Secure API request wrapper
 */
async function secureFetch<T>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  // Validate URL
  if (!url.startsWith("https://")) {
    throw new Error("Only HTTPS URLs allowed");
  }

  // Set secure headers
  const headers = new Headers(options.headers);
  headers.set("X-Requested-With", "XMLHttpRequest");

  // Set timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
      credentials: "omit", // Don't send cookies
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json() as Promise<T>;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Request timeout");
    }
    throw error;
  }
}
```

### 6.2 Rate Limiting

```typescript
/**
 * Simple rate limiter
 */
class RateLimiter {
  private requests: number[] = [];

  constructor(
    private readonly maxRequests: number,
    private readonly windowMs: number,
  ) {}

  canMakeRequest(): boolean {
    const now = Date.now();
    // Remove old requests outside the window
    this.requests = this.requests.filter((time) => now - time < this.windowMs);

    if (this.requests.length < this.maxRequests) {
      this.requests.push(now);
      return true;
    }

    return false;
  }

  getWaitTime(): number {
    if (this.requests.length === 0) return 0;

    const oldestRequest = this.requests[0];
    const waitTime = this.windowMs - (Date.now() - oldestRequest);
    return Math.max(0, waitTime);
  }
}

// Usage
const limiter = new RateLimiter(10, 60000); // 10 requests per minute

async function makeApiCall(url: string) {
  if (!limiter.canMakeRequest()) {
    const waitTime = limiter.getWaitTime();
    throw new Error(`Rate limit exceeded. Wait ${waitTime}ms`);
  }

  return secureFetch(url);
}
```

## 7. Error Handling Security

### 7.1 Safe Error Messages

```typescript
/**
 * Sanitize error messages (don't expose internal details)
 */
function getUserFriendlyError(error: unknown): string {
  if (error instanceof Error) {
    // Map internal errors to user-friendly messages
    const errorMap: Record<string, string> = {
      NetworkError: "Network connection failed. Please check your internet.",
      TimeoutError: "Request timed out. Please try again.",
      UnauthorizedError: "Permission denied. Please log in again.",
    };

    return errorMap[error.name] || "An unexpected error occurred.";
  }

  return "An unknown error occurred.";
}

// Usage
try {
  await riskyOperation();
} catch (error) {
  console.error("Internal error:", error); // Log internally
  showUserMessage(getUserFriendlyError(error)); // Show to user
}
```

### 7.2 Prevent Information Leakage

```typescript
/**
 * Log errors securely
 */
function logError(error: unknown, context: string): void {
  // Don't include sensitive data in logs
  const sanitizedContext = context.replace(/password=\w+/gi, "password=***");

  console.error(`Error in ${sanitizedContext}:`, error);

  // In production, send to error tracking service
  // WITHOUT including user data or tokens
}
```

## 8. Security Checklist

Before deploying, verify:

- [ ] No innerHTML with user input
- [ ] All URLs validated before use
- [ ] No eval() or new Function()
- [ ] CSP compliant (no inline scripts)
- [ ] Minimal permissions requested
- [ ] Message validation implemented
- [ ] Storage data validated
- [ ] Sensitive data encrypted
- [ ] Error messages don't leak info
- [ ] Rate limiting for API calls
- [ ] HTTPS only for external requests

---

**Note**: These patterns follow Chrome Extension Manifest V3 best practices. Always refer to the latest official documentation for updates.
