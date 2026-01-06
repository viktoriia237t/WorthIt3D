# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

WorthIt3D is a 3D printing cost calculator web application built with React, TypeScript, and Vite. It helps users calculate the total cost of 3D prints including materials, electricity, depreciation, labor, and business markup. The app supports both Ukrainian and English languages and includes calculation history with localStorage persistence.

## Build & Development Commands

```bash
# Development server with hot reload
npm run dev

# Build for production (TypeScript compilation + Vite build)
npm run build

# Preview production build locally
npm run preview

# Lint codebase
npm run lint

# Deploy to GitHub Pages (manual deployment)
npm run deploy
```

## Deployment

The project is configured for GitHub Pages deployment:
- **Base path**: `/WorthIt3D/` (configured in vite.config.ts:6)
- **Automatic deployment**: GitHub Actions workflow triggers on push to `master` branch (.github/workflows/deploy.yml)
- The workflow builds the project and deploys to GitHub Pages using the official `deploy-pages` action

## Architecture

### State Management Pattern

The application uses React hooks for state management with localStorage persistence:

1. **Calculator State** (src/types/calculator.ts): Core calculation inputs stored in `CalculationState` interface
   - Materials (weight, spool price/weight)
   - Time (print, prep, post-processing)
   - Costs (electricity, depreciation, consumables, custom expenses)
   - Business parameters (failure rate, markup, OLX fee)

2. **Dual Persistence Strategy**:
   - `CURRENT_MODEL_STORAGE_KEY`: Stores model name and link separately (App.tsx:19)
   - `CURRENT_STATE_STORAGE_KEY`: Stores full calculator state (App.tsx:20)
   - Calculation history managed by `useCalculationHistory` hook

3. **Calculation Engine** (src/hooks/useCalculator.ts): Pure function that takes `CalculationState` and returns `CalculationResult` with cost breakdown using `useMemo` for performance

### Component Structure

- **App.tsx**: Main container with tab navigation (Calculator/History), manages global state and localStorage sync
- **CalculatorForm**: Multi-section form with react-hook-form for input validation
- **CalculationResult**: Real-time cost breakdown display (sticky sidebar on desktop)
- **CalculationHistory**: Table view of saved calculations with edit/delete actions

### Internationalization (i18n)

- Uses `i18next` and `react-i18next` (src/i18n/config.ts)
- Language initialization order: URL param (`?lang=en`) → localStorage → default ('uk')
- Language changes are persisted to both localStorage and URL query parameters (config.ts:37-44)
- Translation files: `src/i18n/locales/en.json` and `src/i18n/locales/uk.json`
- `useSeoMeta` hook (src/hooks/useSeoMeta.ts) updates page meta tags when language changes

### UI Framework

- **HeroUI** (NextUI fork): Component library with dark mode support
- **Tailwind CSS 4.x**: Styling with utility classes
- **Important**: HeroUI requires explicit content path in tailwind.config.js:9 for proper compilation
- Dark mode implemented via `next-themes` with class-based switching (tailwind.config.js:14)

## Key Technical Details

### TypeScript Configuration

- Project uses TypeScript 5.9.x with project references
- Three config files: `tsconfig.json` (root), `tsconfig.app.json` (app code), `tsconfig.node.json` (build tools)

### Calculation Logic

The calculator uses a cost accumulation model (src/hooks/useCalculator.ts):
1. Sum base costs (material, electricity, depreciation, wear, labor, consumables, custom expenses)
2. Apply failure rate multiplier to get total cost
3. Apply markup to get final price
4. Calculate profit as difference
5. Optionally calculate OLX pricing with 2% + 20 UAH commission

### Edit Mode Behavior

When editing a calculation from history (App.tsx:112-122):
- Loads calculation state into form
- Shows blue banner at top with cancel button
- Switches to calculator tab automatically
- "Save" button becomes "Update" button
- Cancel restores default state and exits edit mode

## TODO

- **Replace brand icons**: Lucide-react brand icons (Github, etc.) are deprecated. Migrate to `simple-icons` library for brand icons. See: https://simpleicons.org/
