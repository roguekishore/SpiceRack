# Nightrun Spicerack-Web Review Findings (Phase R)

Review performed against SPEC sections 2, 6, and 7 on `git diff $(cat ../baseline/sha)`.

## Summary
- **Target Versions**: React/React-DOM 19.3.1, Vite 8.3.5, Tailwind CSS 4.3.3 (`@tailwindcss/vite`), Vitest 5.0.5, tw-animate-css 1.4.0.
- **Scope Compliance (G7)**: Only `reactapp/**` and `docs/nightrun/**` modified.
- **Environment Variables**: Zero occurrences of `process.env` in source code; all 28 API references use `import.meta.env.REACT_APP_API_URL`.
- **Public Assets & HTML**: `public/index.html` moved to `reactapp/index.html`, `%PUBLIC_URL%` replaced with root-relative paths, module entry `/src/index.jsx` linked.
- **Routing**: All 13 routes verified identical to baseline routes.
- **Tests**: No tests removed or disabled (`src/App.test.jsx` retained).
- **Lockfile**: `package-lock.json` lockfileVersion 3 is consistent; `npm ci` installs cleanly.
- **Tailwind 4 Visuals**: Identified and resolved two cascade layer priority regressions in `reactapp/src/index.css`.

---

## Detailed Findings

### 1. [Major] Reset Styles Overriding Tailwind Utility Padding and Margins
- **File**: `reactapp/src/index.css:223-230`
- **Severity**: Major (Confirmed & Fixed)
- **Why**: In CSS Cascade Layers (CSS Spec Level 5 as used by Tailwind CSS v4), unlayered CSS rules take precedence over all layered rules regardless of specificity. The preflight/reset block:
  ```css
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  ```
  was unlayered, causing it to override Tailwind utility classes like `p-6`, `p-4`, and `space-y-4` across the application. For example, card headers and form child containers on `/login`, `/cart`, and `/home` lost their padding and margins.
- **Fix**: Encapsulated the base and typography styles inside `@layer base { ... }`. In Tailwind v4's layer ordering (`theme, base, components, utilities`), `@layer utilities` now properly takes precedence over base resets.

### 2. [Major] Container Styles Overriding Max-Width Utilities
- **File**: `reactapp/src/index.css:330-345`
- **Severity**: Major (Confirmed & Fixed)
- **Why**: Custom container rules (`.container`, `.container-narrow`, `.container-wide`) were defined outside `@layer components`. The rule `.container { max-width: var(--container-max); }` (1200px) had unlayered priority and was overriding utility classes such as `max-w-2xl` (672px) in `GroceryUpload.jsx` and `max-w-4xl` (896px) in `RecipeForm.jsx`.
- **Fix**: Wrapped `.container`, `.container-narrow`, and `.container-wide` in `@layer components { ... }` and other text/visual utilities in `@layer utilities { ... }`. Utility classes like `max-w-2xl` in `@layer utilities` now properly override `.container` in `@layer components`.

### 3. [Info] Environment Variable Migration
- **File**: `reactapp/src/context/UserContext.jsx`, `reactapp/src/pages/*.jsx`
- **Severity**: Clean
- **Why**: Audited all 28 API calls across `UserContext.jsx`, `GroceryList.jsx`, `GroceryUpload.jsx`, `Home.jsx`, `Login.jsx`, `MealPlan.jsx`, `Product.jsx`, `RecipeForm.jsx`, `RecipeGenerator.jsx`, `RecipeList.jsx`, `Register.jsx`, and `UserRecipes.jsx`. All were correctly converted to `import.meta.env.REACT_APP_API_URL`. No `process.env` references remain.

### 4. [Info] Static Asset & Public Path Integrity
- **File**: `reactapp/index.html`, `reactapp/public/`
- **Severity**: Clean
- **Why**: Verified `reactapp/index.html` references `/logo.ico`, `/logo192.png`, and `/manifest.json`. All assets remain in `public/` and are copied to `build/` root by Vite.

### 5. [Info] Route and Base Path Consistency
- **File**: `reactapp/src/App.jsx`, `reactapp/vite.config.js`
- **Severity**: Clean
- **Why**: Verified all 13 routes (`/`, `/cart`, `/groceryupload`, `/home`, `/inventory`, `/login`, `/mealplan`, `/orders`, `/products`, `/profile`, `/recipeform`, `/recipes`, `/userrecipes`) render without unhandled errors. `vite.config.js` retains `server.port: 3000`, `build.outDir: 'build'`, `envPrefix: ['VITE_', 'REACT_APP_']`, and `@` path alias.

### 6. [Info] Test Suite Status
- **File**: `reactapp/src/App.test.jsx`, `reactapp/src/setupTests.js`
- **Severity**: Clean
- **Why**: Preserved `App.test.jsx`. Baseline `../baseline/reactapp/tests-passed` was absent due to an existing Jest resolution error in baseline (`react-router/dom`). No tests were removed or skipped.

### 7. [Info] Package Lockfile
- **File**: `reactapp/package-lock.json`
- **Severity**: Clean
- **Why**: Lockfile v3 is generated and committed. Clean `npm ci --no-audit --no-fund` completes with 0 errors.
