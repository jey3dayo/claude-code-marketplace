# Coding Standards

Detailed coding standards for Chrome Extension development with TypeScript, React, and esbuild.

## 1. TypeScript/JavaScript Standards

### 1.1 Language Features

**Use ES6+ Syntax**:

```typescript
// ✅ GOOD: Modern syntax
const items = ['a', 'b', 'c']
const filtered = items.filter(item => item !== 'b')
const message = `Hello, ${name}!`

// ❌ BAD: Old syntax
var items = ['a', 'b', 'c']
var filtered = items.filter(function (item) {
  return item !== 'b'
})
var message = 'Hello, ' + name + '!'
```

**async/await over Promises**:

```typescript
// ✅ GOOD: async/await
async function loadData(): Promise<Data> {
  const response = await fetch(url)
  const data = await response.json()
  return data
}

// ❌ BAD: Promise chains
function loadData(): Promise<Data> {
  return fetch(url)
    .then(response => response.json())
    .then(data => data)
}
```

### 1.2 Error Handling

**Always use try-catch**:

```typescript
// ✅ GOOD: Proper error handling
async function saveData(data: unknown): Promise<void> {
  try {
    await chrome.storage.local.set({ data })
    console.log('Data saved successfully')
  } catch (error) {
    console.error('Failed to save data:', error)
    throw new Error('Save operation failed')
  }
}

// ❌ BAD: No error handling
async function saveData(data: unknown): Promise<void> {
  await chrome.storage.local.set({ data })
}
```

### 1.3 Type Safety

**Avoid `any` type**:

```typescript
// ✅ GOOD: Proper typing
interface User {
  id: number
  name: string
  email: string
}

function processUser(user: User): void {
  console.log(user.name)
}

// ❌ BAD: Using any
function processUser(user: any): void {
  console.log(user.name)
}
```

**Use type guards**:

```typescript
// ✅ GOOD: Type guard
function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'name' in value &&
    'email' in value
  )
}

function handleData(data: unknown): void {
  if (isUser(data)) {
    console.log(data.name) // Type-safe
  }
}
```

### 1.4 Function Documentation

**Use JSDoc comments**:

```typescript
/**
 * Fetches user data from the API
 * @param userId - The unique identifier of the user
 * @returns Promise resolving to user data
 * @throws {Error} If the API request fails
 */
async function fetchUser(userId: number): Promise<User> {
  const response = await fetch(`/api/users/${userId}`)
  if (!response.ok) {
    throw new Error(`Failed to fetch user: ${response.statusText}`)
  }
  return response.json()
}
```

### 1.5 Naming Conventions

**Variables and functions**: camelCase

```typescript
const userName = 'John'
function getUserName(): string {
  return userName
}
```

**Classes and interfaces**: PascalCase

```typescript
class UserManager {
  // implementation
}

interface UserData {
  id: number
  name: string
}
```

**Constants**: UPPER_SNAKE_CASE

```typescript
const MAX_RETRY_COUNT = 3
const API_BASE_URL = 'https://api.example.com'
```

**Private members**: prefix with `_` or use `#` (preferred)

```typescript
class DataStore {
  #cache = new Map<string, unknown>()

  private _updateCache(key: string, value: unknown): void {
    this.#cache.set(key, value)
  }
}
```

## 2. HTML/CSS Standards

### 2.1 Semantic HTML

**Use appropriate tags**:

```html
<!-- ✅ GOOD: Semantic HTML -->
<article>
  <header>
    <h1>Article Title</h1>
    <time datetime="2024-01-01">January 1, 2024</time>
  </header>
  <section>
    <p>Article content...</p>
  </section>
  <footer>
    <button type="button">Share</button>
  </footer>
</article>

<!-- ❌ BAD: Div soup -->
<div>
  <div>
    <div>Article Title</div>
    <div>January 1, 2024</div>
  </div>
  <div>
    <div>Article content...</div>
  </div>
  <div>
    <div>Share</div>
  </div>
</div>
```

### 2.2 CSS Naming (BEM)

**Block-Element-Modifier notation**:

```css
/* Block */
.user-card {
  padding: 16px;
  border: 1px solid #ddd;
}

/* Element */
.user-card__avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
}

.user-card__name {
  font-size: 16px;
  font-weight: bold;
}

/* Modifier */
.user-card--featured {
  border-color: #4285f4;
  background-color: #f0f7ff;
}

.user-card__name--large {
  font-size: 20px;
}
```

**Usage in HTML**:

```html
<div class="user-card user-card--featured">
  <img class="user-card__avatar" src="avatar.png" alt="User avatar" />
  <h2 class="user-card__name user-card__name--large">John Doe</h2>
</div>
```

### 2.3 Responsive Design

**Fixed popup width**:

```css
/* Popup should have fixed width for consistency */
body {
  width: 320px;
  min-height: 400px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
```

### 2.4 Accessibility

**Always include alt text**:

```html
<!-- ✅ GOOD: Descriptive alt text -->
<img src="logo.png" alt="Company logo" />

<!-- ❌ BAD: Missing or empty alt -->
<img src="logo.png" alt="" />
<img src="logo.png" />
```

**Use ARIA attributes**:

```html
<button type="button" aria-label="Close dialog" aria-pressed="false" role="button">
  <span aria-hidden="true">×</span>
</button>
```

## 3. React Standards

### 3.1 Component Structure

**Functional components with hooks**:

```typescript
import { useState, useEffect } from 'react';

interface Props {
  userId: number;
}

export function UserProfile({ userId }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const data = await fetchUser(userId);
        setUser(data);
      } catch (error) {
        console.error('Failed to load user:', error);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div className="user-profile">
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  );
}
```

### 3.2 Props Interface

**Define clear prop types**:

```typescript
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
}

export function Button({
  label,
  onClick,
  disabled = false,
  variant = 'primary'
}: ButtonProps) {
  return (
    <button
      type="button"
      className={`button button--${variant}`}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </button>
  );
}
```

### 3.3 Event Handlers

**Use descriptive handler names**:

```typescript
export function LoginForm() {
  const [email, setEmail] = useState('');

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // Handle login
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={handleEmailChange}
      />
      <button type="submit">Login</button>
    </form>
  );
}
```

## 4. File Organization

### 4.1 Directory Structure

```
src/
├── background/
│   ├── index.ts
│   ├── messaging.ts
│   └── storage.ts
├── content/
│   ├── index.ts
│   └── dom-utils.ts
├── pages/
│   ├── popup/
│   │   ├── index.tsx
│   │   ├── App.tsx
│   │   └── components/
│   └── options/
│       ├── index.tsx
│       └── App.tsx
├── shared/
│   ├── types.ts
│   ├── constants.ts
│   └── utils.ts
├── ui/
│   ├── Button.tsx
│   ├── Input.tsx
│   └── Modal.tsx
└── styles/
    ├── base.css
    ├── layout.css
    └── tokens/
        ├── primitives.css
        ├── semantic.css
        └── components.css
```

### 4.2 File Naming

- **Components**: PascalCase (e.g., `UserProfile.tsx`)
- **Utilities**: camelCase (e.g., `dateUtils.ts`)
- **Styles**: kebab-case (e.g., `user-profile.css`)
- **Constants**: UPPER_SNAKE_CASE file (e.g., `API_CONSTANTS.ts`)

## 5. Testing Standards

### 5.1 Unit Test Structure

**AAA Pattern (Arrange, Act, Assert)**:

```typescript
import { describe, it, expect } from 'vitest'
import { calculateTotal } from './utils'

describe('calculateTotal', () => {
  it('should sum array of numbers correctly', () => {
    // Arrange
    const numbers = [1, 2, 3, 4, 5]

    // Act
    const result = calculateTotal(numbers)

    // Assert
    expect(result).toBe(15)
  })

  it('should return 0 for empty array', () => {
    // Arrange
    const numbers: number[] = []

    // Act
    const result = calculateTotal(numbers)

    // Assert
    expect(result).toBe(0)
  })
})
```

### 5.2 Test Coverage

**Focus on**:

- Pure functions
- Business logic
- Edge cases
- Error handling

**Don't test**:

- Third-party libraries
- Simple getters/setters
- Trivial code

## 6. Code Quality Tools

### 6.1 Biome (via ultracite)

**Lint command**:

```bash
pnpm lint        # Check code quality
pnpm lint:fix    # Auto-fix issues
pnpm doctor      # Comprehensive health check
```

### 6.2 TypeScript

**Type checking**:

```bash
pnpm typecheck   # Check types without emitting
```

**tsconfig.json**:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "target": "ES2020",
    "jsx": "react-jsx"
  }
}
```

## 7. Git Commit Messages

### 7.1 Commit Format

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

**Types**:

- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `style`: Changes that don't affect code meaning (formatting)
- `test`: Adding or updating tests
- `docs`: Documentation changes
- `chore`: Maintenance tasks

**Examples**:

```
feat(popup): add dark mode toggle

Add user preference for dark mode theme in popup UI.
Stores preference in chrome.storage.sync.

feat: implement table auto-fill feature
fix(content): prevent duplicate table processing
refactor: extract DOM manipulation to utility module
docs: update README with new features
```

## 8. Performance Best Practices

### 8.1 Avoid Heavy Computations

**Use debounce for expensive operations**:

```typescript
function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: number | undefined

  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = window.setTimeout(() => func(...args), wait)
  }
}

// Usage
const handleSearch = debounce((query: string) => {
  // Expensive search operation
}, 300)
```

### 8.2 Lazy Loading

**Split code with dynamic imports**:

```typescript
// Load heavy module only when needed
async function loadHeavyFeature() {
  const module = await import('./heavy-feature')
  module.initialize()
}

document.getElementById('load-feature')!.addEventListener('click', loadHeavyFeature)
```

### 8.3 Memoization

**Cache expensive computations**:

```typescript
const cache = new Map<string, unknown>()

function memoize<T>(key: string, compute: () => T): T {
  if (cache.has(key)) {
    return cache.get(key) as T
  }

  const result = compute()
  cache.set(key, result)
  return result
}
```

## 9. Documentation Standards

### 9.1 README.md

**Must include**:

- Project description
- Installation instructions
- Usage examples
- Configuration options
- Development setup
- License

### 9.2 Code Comments

**When to comment**:

- Complex algorithms
- Non-obvious business logic
- Workarounds for browser issues
- TODO/FIXME items

**When NOT to comment**:

- Obvious code
- Self-explanatory function names
- Redundant descriptions

```typescript
// ❌ BAD: Obvious comment
// Increment counter by 1
counter++

// ✅ GOOD: Explains why
// Increment by 2 to skip even numbers for performance optimization
counter += 2
```

---

**Note**: Follow these standards consistently across the project. Use automated tools (Biome, TypeScript, Vitest) to enforce quality.
