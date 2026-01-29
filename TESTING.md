# Testing Documentation

## Test Setup

This project uses **Vitest** as the testing framework, along with React Testing Library for component testing.

### Dependencies

- `vitest` - Test runner (Vite-native)
- `@testing-library/react` - React component testing utilities
- `@testing-library/jest-dom` - Custom matchers for assertions
- `@testing-library/user-event` - User interaction simulation
- `jsdom` - DOM implementation for Node.js
- `@vitest/ui` - Visual test UI

## Running Tests

```bash
# Run tests in watch mode (default)
npm test

# Run tests once (CI mode)
npm run test:run

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## Test Structure

Tests are organized in the `src/tests/` directory, mirroring the source code structure:

```
src/
├── hooks/
│   └── useCalculator.ts
├── tests/
│   ├── hooks/
│   │   └── useCalculator.test.ts
│   └── setup.ts
```

## Test Coverage

### Calculator Logic (`src/tests/hooks/useCalculator.test.ts`)

Comprehensive test suite covering:

#### 1. Material Cost Calculation
- ✅ Correct calculation: `(weight × spoolPrice) / spoolWeight`
- ✅ Division by zero handling (spoolWeight = 0)
- ✅ Zero weight handling

#### 2. Electricity Cost Calculation
- ✅ Printer-only electricity (dryer consumption = 0)
- ✅ Combined electricity with separate dry time
- ✅ Dry during print (uses printTime as dryTime)
- ✅ Dryer consumption = 0 doesn't affect calculation

#### 3. Depreciation Cost Calculation
- ✅ Printer depreciation: `(printerPrice / lifespan) × printTime`
- ✅ Nozzle wear: `(nozzlePrice / nozzleLifespan) × printTime`
- ✅ Bed wear: `(bedPrice / bedLifespan) × printTime`
- ✅ Division by zero handling

#### 4. Labor Cost Calculation
- ✅ Labor from prep and post time: `(prepTime + postTime) × hourlyRate`
- ✅ Zero labor time handling

#### 5. Consumables and Custom Expenses
- ✅ Consumables cost inclusion
- ✅ Total custom expenses calculation
- ✅ Base expenses (includeInFee=true) in subtotal
- ✅ Fee expenses (includeInFee=false) in final price

#### 6. Failure Rate Calculation
- ✅ Correct application: `subtotal × (1 + failureRate/100)`
- ✅ Zero failure rate handling

#### 7. Markup and Final Price
- ✅ Markup application: `totalCost × (markup/100) + laborCost`
- ✅ Fee expenses addition to final price
- ✅ Profit calculation: `finalPrice - totalCost`

#### 8. OLX Fee Calculation
- ✅ OLX price when enabled: `finalPrice × 1.02 + 20`
- ✅ Zero OLX price when disabled
- ✅ OLX profit: `olxPrice - totalCost`

#### 9. Complex Scenarios
- ✅ Complete calculation with all features enabled
- ✅ Integration of all cost components

### History Management (`src/tests/hooks/useCalculationHistory.test.ts`)

Comprehensive test suite for calculation history and localStorage persistence:

#### 1. Initialization
- ✅ Empty history on first use
- ✅ Load history from localStorage on mount
- ✅ Sort history by timestamp descending
- ✅ Handle corrupted localStorage data gracefully

#### 2. Adding Calculations (addCalculation)
- ✅ Add new calculation to history
- ✅ Add calculations to the front of the list
- ✅ Generate unique IDs
- ✅ Persist to localStorage after adding

#### 3. Deleting Calculations (deleteCalculation)
- ✅ Delete calculation by ID
- ✅ Not affect other calculations when deleting
- ✅ Handle non-existent IDs gracefully

#### 4. Updating Calculations (updateCalculation)
- ✅ Update existing calculation
- ✅ Move updated calculation to the front
- ✅ Update timestamp on update

#### 5. Clear History (clearHistory)
- ✅ Clear all non-pinned calculations
- ✅ Preserve pinned calculations when clearing

#### 6. Pin/Unpin (togglePin)
- ✅ Pin a calculation
- ✅ Unpin a pinned calculation
- ✅ Sort pinned items to the front

#### 7. Get Calculation (getCalculation)
- ✅ Retrieve calculation by ID
- ✅ Return undefined for non-existent ID

#### 8. Upsert (upsertCalculation)
- ✅ Create new when ID is null
- ✅ Update existing when ID exists
- ✅ Create new when ID doesn't exist
- ✅ Return the saved ID

#### 9. Import History (importHistory)
- ✅ Replace strategy: Replace all history
- ✅ Skip strategy: Skip duplicate IDs
- ✅ Update strategy: Update duplicates, preserve pinned status
- ✅ Sort imported history correctly (pinned first, then by timestamp)

#### 10. localStorage Persistence
- ✅ Persist history on changes
- ✅ Handle localStorage errors gracefully

## Test Statistics

- **Total Tests**: 56
- **Passing**: 56 ✅
- **Test Files**: 2
  - Calculator logic (`useCalculator.test.ts`): 25 tests
  - History management (`useCalculationHistory.test.ts`): 31 tests

## Writing New Tests

### Example Test Structure

```typescript
import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useCalculator } from '../../hooks/useCalculator';
import { CalculationState, DEFAULT_CALCULATION_STATE } from '../../types/calculator';

describe('Feature Name', () => {
  it('should test specific behavior', () => {
    const state: CalculationState = {
      ...DEFAULT_CALCULATION_STATE,
      // Override specific fields
      weight: 100,
      spoolPrice: 800,
    };

    const { result } = renderHook(() => useCalculator(state));

    expect(result.current.materialCost).toBe(expectedValue);
  });
});
```

### Testing Best Practices

1. **Test behavior, not implementation** - Focus on what the function does, not how
2. **Use descriptive test names** - Each test should explain what it's testing
3. **One assertion per test** - Makes failures easier to diagnose
4. **Use `toBeCloseTo` for floating-point** - Avoid precision issues
5. **Test edge cases** - Zero values, division by zero, negative numbers
6. **Keep tests isolated** - Each test should be independent

## CI/CD Integration

Tests run automatically in CI/CD pipelines. Ensure all tests pass before merging:

```bash
npm run test:run
```

## Future Test Additions

Potential areas for additional testing:

- [ ] Tests for `useSaveManager` (auto-save logic)
- [ ] Tests for `useCalculationManager` (form state management)
- [ ] Component tests for `CalculatorForm`
- [ ] Component tests for `CalculationResult`
- [ ] Component tests for `CalculationHistory` table
- [ ] Tests for i18n translations
- [ ] E2E tests with Playwright/Cypress
