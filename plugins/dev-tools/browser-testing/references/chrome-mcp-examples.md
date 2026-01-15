# Chrome MCP Test Examples

This reference provides detailed implementation examples for common browser testing scenarios using Chrome DevTools MCP.

## 1. Login Flow Testing (Auth0/OAuth)

### Scenario

Test authentication flow with Auth0, verify session persistence, and check cookie behavior.

### Implementation

```typescript
// Step 1: Navigate to login page
;(await mcp__chrome) -
  devtools__navigate_page({
    url: 'http://localhost:3000',
  })

// Step 2: Take initial snapshot to find login button
const snapshot = (await mcp__chrome) - devtools__take_snapshot({ verbose: false })
// Look for "Log In" or "Sign In" button UID in snapshot

// Step 3: Click login button
;(await mcp__chrome) - devtools__click({ uid: 'login-button-uid' })

// Step 4: Wait for Auth0 redirect (if using hosted login)
;(await mcp__chrome) -
  devtools__wait_for({
    text: 'Sign in to',
    timeout: 5000,
  })

// Step 5: Fill Auth0 credentials
const authSnapshot = (await mcp__chrome) - devtools__take_snapshot({ verbose: false })
;(await mcp__chrome) -
  devtools__fill({
    uid: 'email-input-uid',
    value: 'test@example.com',
  })
;(await mcp__chrome) -
  devtools__fill({
    uid: 'password-input-uid',
    value: 'password123',
  })

// Step 6: Submit login form
;(await mcp__chrome) - devtools__click({ uid: 'submit-button-uid' })

// Step 7: Wait for redirect back to app
;(await mcp__chrome) -
  devtools__wait_for({
    text: 'Welcome',
    timeout: 10000,
  })

// Step 8: Verify logged-in state
const loggedInSnapshot = (await mcp__chrome) - devtools__take_snapshot({ verbose: false })
// Check for user name, profile menu, or logout button

// Step 9: Check console for errors
const consoleMessages =
  (await mcp__chrome) -
  devtools__list_console_messages({
    types: ['error', 'warn'],
  })

// Step 10: Verify session persistence with page reload
;(await mcp__chrome) - devtools__navigate_page({ url: 'http://localhost:3000' })
;(await mcp__chrome) -
  devtools__wait_for({
    text: 'Welcome',
    timeout: 5000,
  })
// If user still logged in, session is persisted
```

### Expected Results

- ✅ Redirect to Auth0 login page
- ✅ Successful authentication
- ✅ Redirect back to app with user session
- ✅ User name displayed
- ✅ Session persists after page reload
- ✅ No console errors

## 2. Form Validation Testing

### Scenario

Test form submission with client-side validation, verify error messages, and check API interactions.

### Implementation

```typescript
// Step 1: Navigate to form page
;(await mcp__chrome) -
  devtools__navigate_page({
    url: 'http://localhost:3000/profile/update',
  })

// Step 2: Test empty form submission (trigger validation)
const snapshot = (await mcp__chrome) - devtools__take_snapshot({ verbose: false })
;(await mcp__chrome) - devtools__click({ uid: 'submit-button-uid' })

// Step 3: Verify validation error messages
;(await mcp__chrome) -
  devtools__wait_for({
    text: 'required',
    timeout: 2000,
  })
const errorSnapshot = (await mcp__chrome) - devtools__take_snapshot({ verbose: false })
// Check for error messages near form fields

// Step 4: Fill valid form data
;(await mcp__chrome) -
  devtools__fill({
    uid: 'name-input-uid',
    value: 'John Doe',
  })
;(await mcp__chrome) -
  devtools__fill({
    uid: 'email-input-uid',
    value: 'john@example.com',
  })

// Step 5: Submit form with valid data
;(await mcp__chrome) - devtools__click({ uid: 'submit-button-uid' })

// Step 6: Check network requests for API call
const networkRequests =
  (await mcp__chrome) -
  devtools__list_network_requests({
    resourceTypes: ['xhr', 'fetch'],
  })
// Look for POST request to /api/profile or similar

// Step 7: Verify success message
;(await mcp__chrome) -
  devtools__wait_for({
    text: 'successfully',
    timeout: 5000,
  })

// Step 8: Take screenshot for visual confirmation
;(await mcp__chrome) -
  devtools__take_screenshot({
    fullPage: false,
    format: 'png',
  })
```

### Expected Results

- ✅ Validation errors displayed for empty fields
- ✅ Error messages cleared when fields filled
- ✅ API request sent with correct payload
- ✅ Success message displayed
- ✅ Form cleared or redirected after submission

## 3. Session Persistence Verification

### Scenario

Verify that authentication sessions persist across page refreshes and tab closures.

### Implementation

```typescript
// Prerequisite: User already logged in from Example 1

// Test 1: Page refresh
;(await mcp__chrome) - devtools__navigate_page({ url: 'http://localhost:3000' })
;(await mcp__chrome) -
  devtools__wait_for({
    text: 'Welcome',
    timeout: 5000,
  })
// ✅ Session persisted if user still logged in

// Test 2: Navigate away and back
;(await mcp__chrome) - devtools__navigate_page({ url: 'http://localhost:3000/about' })
;(await mcp__chrome) - devtools__navigate_page_history({ navigate: 'back' })
;(await mcp__chrome) -
  devtools__wait_for({
    text: 'Welcome',
    timeout: 5000,
  })
// ✅ Session persisted across navigation

// Test 3: Check cookies (optional, for debugging)
const cookies =
  (await mcp__chrome) -
  devtools__evaluate_script({
    function: `() => {
    return document.cookie
      .split('; ')
      .map(c => {
        const [name, value] = c.split('=');
        return { name, value };
      });
  }`,
  })
// Verify auth0 cookies present

// Test 4: New tab (simulate tab closure)
;(await mcp__chrome) - devtools__new_page({ url: 'http://localhost:3000' })
const pages = (await mcp__chrome) - devtools__list_pages()
;(await mcp__chrome) - devtools__select_page({ pageIdx: pages.length - 1 })
;(await mcp__chrome) -
  devtools__wait_for({
    text: 'Welcome',
    timeout: 5000,
  })
// ✅ Session persisted in new tab
```

### Expected Results

- ✅ User remains logged in after page refresh
- ✅ User remains logged in after navigation
- ✅ Auth cookies present and valid
- ✅ Session shared across tabs

## 4. Cookie Inspection and Debugging

### Scenario

Inspect authentication cookies to debug login issues (e.g., missing cookies, incorrect `Secure` flag).

### Implementation

```typescript
// Navigate to page where cookies should be set
;(await mcp__chrome) -
  devtools__navigate_page({
    url: 'http://localhost:3000/api/auth/callback?code=...',
  })

// Method 1: Evaluate script to read document.cookie
const documentCookies =
  (await mcp__chrome) -
  devtools__evaluate_script({
    function: `() => {
    return document.cookie;
  }`,
  })

// Method 2: Parse cookies for debugging
const parsedCookies =
  (await mcp__chrome) -
  devtools__evaluate_script({
    function: `() => {
    const cookies = document.cookie.split('; ');
    return cookies.map(c => {
      const [name, value] = c.split('=');
      return {
        name,
        value: value.substring(0, 20) + '...', // Truncate for security
        length: value.length
      };
    });
  }`,
  })

// Method 3: Check for specific auth cookies
const hasAuthCookie =
  (await mcp__chrome) -
  devtools__evaluate_script({
    function: `() => {
    return document.cookie.includes('appSession');
  }`,
  })

// Method 4: Console log for debugging (will appear in console messages)
;(await mcp__chrome) -
  devtools__evaluate_script({
    function: `() => {
    console.log('Auth cookies:', document.cookie);
  }`,
  })

const consoleMessages =
  (await mcp__chrome) -
  devtools__list_console_messages({
    types: ['log', 'error'],
  })
```

### Common Cookie Issues

- **Missing cookies**: Check `AUTH0_COOKIE_SECURE` setting (should be `false` for localhost)
- **Cookie not sent**: Verify `SameSite` attribute (should be `Lax` or `None`)
- **Cookie expired**: Check `maxAge` or `expires` attribute
- **Cookie domain mismatch**: Ensure domain matches `localhost` or actual domain

## 5. Multi-Page Navigation Flow

### Scenario

Test a multi-step wizard or onboarding flow with navigation between pages.

### Implementation

```typescript
// Step 1: Start at homepage
;(await mcp__chrome) -
  devtools__navigate_page({
    url: 'http://localhost:3000',
  })

// Step 2: Click "Get Started" button
const homeSnapshot = (await mcp__chrome) - devtools__take_snapshot({ verbose: false })
;(await mcp__chrome) - devtools__click({ uid: 'get-started-button-uid' })

// Step 3: Fill step 1 form
;(await mcp__chrome) -
  devtools__wait_for({
    text: 'Step 1',
    timeout: 3000,
  })
const step1Snapshot = (await mcp__chrome) - devtools__take_snapshot({ verbose: false })
;(await mcp__chrome) -
  devtools__fill({
    uid: 'name-input-uid',
    value: 'John Doe',
  })
;(await mcp__chrome) - devtools__click({ uid: 'next-button-uid' })

// Step 4: Fill step 2 form
;(await mcp__chrome) -
  devtools__wait_for({
    text: 'Step 2',
    timeout: 3000,
  })
const step2Snapshot = (await mcp__chrome) - devtools__take_snapshot({ verbose: false })
;(await mcp__chrome) -
  devtools__fill({
    uid: 'email-input-uid',
    value: 'john@example.com',
  })
;(await mcp__chrome) - devtools__click({ uid: 'next-button-uid' })

// Step 5: Submit final step
;(await mcp__chrome) -
  devtools__wait_for({
    text: 'Step 3',
    timeout: 3000,
  })
const step3Snapshot = (await mcp__chrome) - devtools__take_snapshot({ verbose: false })
;(await mcp__chrome) - devtools__click({ uid: 'submit-button-uid' })

// Step 6: Verify completion
;(await mcp__chrome) -
  devtools__wait_for({
    text: 'Complete',
    timeout: 5000,
  })
const completeSnapshot = (await mcp__chrome) - devtools__take_snapshot({ verbose: false })

// Step 7: Test back navigation (if supported)
;(await mcp__chrome) - devtools__navigate_page_history({ navigate: 'back' })
;(await mcp__chrome) -
  devtools__wait_for({
    text: 'Step 3',
    timeout: 3000,
  })
// ✅ Form state preserved across navigation
```

### Expected Results

- ✅ Smooth navigation between steps
- ✅ Form data preserved when navigating back
- ✅ Progress indicator updates correctly
- ✅ Final submission succeeds

## 6. Error Handling and Debugging

### Scenario

Capture and analyze JavaScript errors, network failures, and console warnings.

### Implementation

```typescript
// Navigate to page with potential errors
;(await mcp__chrome) -
  devtools__navigate_page({
    url: 'http://localhost:3000/problematic-page',
  })

// Check for JavaScript errors
const consoleMessages =
  (await mcp__chrome) -
  devtools__list_console_messages({
    types: ['error', 'warn'],
    includePreservedMessages: true, // Include errors from previous navigations
  })

// Check for failed network requests
const networkRequests =
  (await mcp__chrome) -
  devtools__list_network_requests({
    resourceTypes: ['xhr', 'fetch', 'document'],
    includePreservedRequests: true,
  })

// Filter failed requests (status >= 400)
const failedRequests = networkRequests.filter(req => req.status >= 400)

// Get detailed error info
for (const request of failedRequests) {
  const details =
    (await mcp__chrome) -
    devtools__get_network_request({
      reqid: request.id,
    })
  // Analyze request/response headers, payload, error message
}

// Take screenshot for visual debugging
;(await mcp__chrome) -
  devtools__take_screenshot({
    fullPage: true,
    format: 'png',
  })

// Check for specific console error patterns
const authErrors = consoleMessages.filter(
  msg => msg.text.includes('auth') || msg.text.includes('401')
)
```

### Expected Results

- ✅ All console errors identified and logged
- ✅ Failed network requests captured with details
- ✅ Screenshot shows visual error state (if applicable)
- ✅ Root cause identified for debugging

## Best Practices Summary

1. **Always snapshot first**: Capture accessibility tree before screenshots (more efficient)
2. **Wait strategically**: Use `wait_for` with specific text instead of arbitrary timeouts
3. **Check console**: Always inspect console messages after critical operations
4. **Verify network**: Monitor API calls to confirm backend interactions
5. **Clean up**: Close test pages after completion to avoid resource leaks
6. **Error handling**: Expect failures and capture detailed error info for debugging
7. **Session testing**: Always verify session persistence across refreshes/navigation
8. **Cookie debugging**: Use `evaluate_script` to inspect cookies when auth issues occur

## Troubleshooting Common Issues

### Issue: "Element not found" error

**Solution**: Take snapshot first, verify UID exists in accessibility tree

### Issue: "Timeout waiting for text"

**Solution**: Check console for JS errors, verify text is actually rendered, increase timeout if needed

### Issue: Login works but session not persisted

**Solution**: Check cookies (Method 4 in Example 4), verify `AUTH0_COOKIE_SECURE=false` for localhost

### Issue: Network requests not captured

**Solution**: Use `includePreservedRequests: true` to see requests from previous navigations

### Issue: "Page not responding"

**Solution**: Check if development server is running, verify URL is correct, check for JS errors blocking page load
