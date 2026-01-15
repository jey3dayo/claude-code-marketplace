---
name: browser-testing
description: |
  [What] Automate browser-based testing using Chrome MCP for login flows, UI interactions, and localhost verification
  [When] Use when: users mention "localhost", "browser check", "login test", "UI verification", or request manual browser confirmation (e.g., "access http://localhost:3000 and check login"). Proactively suggests Chrome MCP testing when appropriate
  [Keywords] localhost, browser check, login test, UI verification, access http://localhost:3000 and check login
---

# Browser Testing

## Overview

Automate browser-based testing using Chrome DevTools MCP to verify authentication flows, UI interactions, Cookie/session behavior, and local development server functionality. Replace manual "please check in your browser" requests with automated, reproducible tests that provide immediate visual confirmation.

## When to Use This Skill

Trigger this skill when encountering scenarios that require browser interaction:

- **Localhost verification**: Testing development servers (e.g., `http://localhost:3000`)
- **Authentication flows**: Login/logout, OAuth callbacks, session management
- **UI interactions**: Form submission, validation, button clicks, navigation
- **Cookie/session behavior**: Auth0 cookies, JWT tokens, session persistence
- **Visual confirmation**: Layout rendering, responsive design, error messages

**Proactive suggestion**: When completing backend changes (e.g., Auth0 configuration, API endpoints), automatically propose Chrome MCP testing instead of asking users to manually verify.

## Chrome MCP Workflow

### Step 1: Start Development Server (if needed)

Before browser testing, ensure the development server is running:

```bash
# Example for Next.js projects
pnpm dev
# Wait for "Ready on http://localhost:3000" message
```

### Step 2: Navigate to Target Page

Use Chrome MCP to open and navigate to the target URL:

```typescript
// List existing browser pages
mcp__chrome - devtools__list_pages();

// Navigate to localhost (or create new page if needed)
mcp__chrome - devtools__navigate_page({ url: "http://localhost:3000" });
```

### Step 3: Take Initial Snapshot

Capture the page state for verification:

```typescript
// Text-based snapshot (preferred for accessibility tree analysis)
mcp__chrome - devtools__take_snapshot({ verbose: false });

// Screenshot for visual confirmation
mcp__chrome - devtools__take_screenshot({ fullPage: true, format: "png" });
```

### Step 4: Perform Interactions

Execute user actions using element UIDs from snapshot:

```typescript
// Click login button
mcp__chrome - devtools__click({ uid: "element-uid-from-snapshot" });

// Fill form fields
mcp__chrome -
  devtools__fill({ uid: "email-input-uid", value: "test@example.com" });
mcp__chrome -
  devtools__fill({ uid: "password-input-uid", value: "password123" });

// Submit form
mcp__chrome - devtools__click({ uid: "submit-button-uid" });
```

### Step 5: Wait and Verify Results

Wait for navigation/state changes and verify outcomes:

```typescript
// Wait for specific text to appear
mcp__chrome - devtools__wait_for({ text: "Welcome", timeout: 5000 });

// Take post-interaction snapshot
mcp__chrome - devtools__take_snapshot({ verbose: false });

// Check console for errors
mcp__chrome - devtools__list_console_messages({ types: ["error", "warn"] });

// Inspect network requests (e.g., API calls, redirects)
mcp__chrome -
  devtools__list_network_requests({ resourceTypes: ["xhr", "fetch"] });
```

### Step 6: Report Results

Summarize test outcomes with evidence:

- **Success criteria met**: Screenshot showing expected UI state
- **Console errors**: List any JavaScript errors or warnings
- **Network issues**: Failed API calls or redirect problems
- **Accessibility tree**: Structural verification from snapshot

## Common Test Patterns

See `references/chrome-mcp-examples.md` for detailed examples:

- Login flow testing (OAuth, Auth0)
- Form validation and submission
- Session persistence verification
- Cookie inspection and debugging
- Multi-page navigation flows

## Best Practices

1. **Snapshot first**: Always capture snapshot before taking screenshots (more token-efficient)
2. **Use UIDs**: Reference elements by UID from snapshot, not by selector guessing
3. **Wait strategically**: Use `wait_for` for dynamic content instead of arbitrary delays
4. **Check console**: Always inspect console messages for hidden errors
5. **Network verification**: Monitor network requests to confirm API interactions
6. **Cleanup**: Close test pages after completion to avoid resource leaks

## Integration with Development Workflow

### After Backend Changes

When modifying authentication, API endpoints, or server configuration:

```markdown
✅ Code changes applied
✅ Development server restarted
🔍 **Automated browser test**: Verifying changes with Chrome MCP...

- Navigate to login page
- Execute authentication flow
- Verify session persistence
- Check console for errors
  ✅ Test passed: User logged in successfully, session active
```

### During Code Review

When reviewing UI changes:

```markdown
📝 Code review complete
🔍 **Visual verification**: Taking screenshots with Chrome MCP...

- Before/after comparison
- Responsive design check
- Accessibility tree analysis
  ✅ UI changes verified: Layout renders correctly, no console errors
```

## Resources

### references/chrome-mcp-examples.md

Detailed test examples for common scenarios (login flows, form validation, session handling).

---

**Note**: Scripts and assets directories are not included in this skill as Chrome MCP provides all necessary testing capabilities through its tool API.
