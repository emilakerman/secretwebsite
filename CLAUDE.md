# CLAUDE.md

## Project

Geography quiz web app ("secretwebsite"). Multiple-choice trivia, progress tracking, results/scoring screen, dark/light mode toggle. Deployed to Firebase Hosting.

**Stack:** Vue 3 (Composition API / `<script setup>`) · Vite 5 · Vitest 1 · `@vue/test-utils` 2 · jsdom · plain CSS with custom properties. No TypeScript, no ESLint, no CSS framework.

---

## Branch & Commit Conventions

**Base branch:** `main`

**Branch naming:**
```
{user}/{team-slug}/{ticket-id}-{kebab-case-description}
# e.g. emilakerman/rustyjimmies/sec-8-add-timer-feature
```

**Commit message format:**
```
{Verb} {description} (TICKET-ID)
# e.g. "Add timer feature (SEC-8)"
```

---

## Commands

```bash
npm ci            # install (used in CI)
npm run dev       # Vite dev server → http://localhost:3000
npm run build     # production build → dist/
npm run preview   # preview dist/ locally
npm test          # run Vitest (watch mode; use `npx vitest run` for CI-style single pass)
```

**CI** (`.github/workflows/`):
- PRs: build only (`npm ci && npm run build`), deploy Firebase preview channel
- Merge to `main`: build + deploy to Firebase live channel
- Tests are **not** run in CI — run them locally before opening a PR.

Test file discovery pattern (from `vitest.config.js`): `src/**/*.{test,spec}.{js,ts}`

---

## Key Directories

```
src/
  components/       Vue SFCs
    QuizContainer.vue   Main quiz logic, state management, results screen
    QuestionCard.vue    Renders a single question + answer options
    ThemeToggle.vue     Dark/light mode button
  data/
    quizQuestions.js    Exports `quizQuestions[]` — 500 geography questions
  assets/
    main.css            Global styles; all CSS custom properties (theme vars)
  App.vue             Root component — mounts QuizContainer
  App.test.js         Only test file (Vitest + @vue/test-utils)

index.html          Vite entry point (root level — NOT public/index.html)
public/             Static assets (favicon.svg); public/index.html is Firebase boilerplate, not the app
.github/workflows/  CI/CD pipelines
```

---

## Coding Conventions

### Vue SFCs
- Always use `<script setup>` (Composition API). No Options API.
- File order: `<script setup>` → `<template>` → `<style scoped>`
- All component styles are `<style scoped>`; only global/theme CSS goes in `src/assets/main.css`

### JavaScript
- Import `ref`, `computed`, etc. individually from `'vue'`
- State: `const foo = ref(initialValue)`
- Derived state: `const bar = computed(() => ...)`
- Event handlers: camelCase verbs — `handleSelect`, `handleKeydown`, `goToNext`, `restartQuiz`
- `defineProps` / `defineEmits` — compiler macros, no import needed
- Strict JS via `jsconfig.json` (`noUnusedLocals`, `noUnusedParameters`)

### Props
```js
defineProps({
  question:      { type: Object,  required: true },
  selectedIndex: { type: Number,  default: null },
  isAnswered:    { type: Boolean, default: false }
})
```

### CSS
- All theming via CSS custom properties: `var(--bg-primary)`, `var(--accent-color)`, etc.
- Light defaults on `:root`; dark overrides under `.dark` selector applied to `<html>`
- Toggle dark mode: `document.documentElement.classList.toggle('dark')`
- Class names: kebab-case BEM-ish (`.quiz-container`, `.answer-option`, `.score-stat`)
- Transition durations: `0.15s`–`0.3s ease`

### Naming
| Thing | Convention |
|---|---|
| Component files | PascalCase (`QuizContainer.vue`) |
| Data/util files | camelCase (`quizQuestions.js`) |
| CSS classes | kebab-case |
| JS vars/functions | camelCase |

### Data Model
```js
// quizQuestions entry
{
  id: Number,          // sequential, 1-based
  question: String,
  options: String[],   // exactly 4 items
  correctIndex: Number // 0-based index into options[]
}
```

---

## How to Add X

### New Vue component
1. Create `src/components/MyComponent.vue` using `<script setup>` + `<style scoped>`.
2. Import and register in the parent (`QuizContainer.vue` or `App.vue`):
   ```js
   import MyComponent from './MyComponent.vue'
   ```
3. Use in template: `<MyComponent :prop="value" @event="handler" />`

### New quiz questions
Append objects to the array in `src/data/quizQuestions.js`:
```js
{
  id: 501,                          // next sequential id
  question: "What is the capital of X?",
  options: ["A", "B", "C", "D"],    // exactly 4
  correctIndex: 2                   // 0-based
}
```

### New feature / state in the quiz
All quiz logic lives in `QuizContainer.vue`:
1. Add state: `const myState = ref(initialValue)`
2. Add derived value: `const myComputed = computed(() => ...)`
3. Add handler: `function handleMyAction() { ... }`
4. Bind in template with `:prop`, `@event`, `v-if`, etc.

### New "screen" (view)
No router. Screens are toggled with `v-if`/`v-else` driven by a `ref` in `QuizContainer.vue` (e.g., `showResults`). Add a new boolean ref and render the screen inline or extract it into a component.

### New theme variable
Add to **both** blocks in `src/assets/main.css`:
```css
:root {
  --my-new-var: #lightvalue;
}
.dark {
  --my-new-var: #darkvalue;
}
```
Use as `var(--my-new-var)` in any `<style scoped>` block.

### New test
Create `src/components/MyComponent.test.js` (or alongside any source file):
```js
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import MyComponent from './MyComponent.vue'

describe('MyComponent', () => {
  it('renders correctly', () => {
    const wrapper = mount(MyComponent, { props: { /* ... */ } })
    expect(wrapper.text()).toContain('expected text')
  })
})
```
Run: `npm test` (watch) or `npx vitest run` (single pass).
