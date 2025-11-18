# Test Suite

This directory contains unit tests for the workflow and budget management features.

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test WorkflowDashboard.test
```

## Test Structure

```
src/
├── test/
│   └── setup.ts              # Test configuration and global mocks
├── pages/
│   └── __tests__/
│       └── WorkflowDashboard.test.tsx
├── components/
│   └── workflow/
│       └── __tests__/
│           └── QuickApprovalCard.test.tsx
└── api/
    └── __tests__/
        └── workflows.test.ts
```

## Test Coverage

Current test coverage includes:

### Components
- **WorkflowDashboard**: Dashboard rendering, stats display, approval actions
- **QuickApprovalCard**: Quick approval interface, comment handling, validation
- **BudgetManagement**: Budget CRUD operations, sub-budget management

### API
- **workflowsApi**: All workflow API endpoints and error handling

### Features Tested
✅ Component rendering
✅ User interactions (approve, reject, comment)
✅ API integration
✅ Error handling
✅ Loading states
✅ Empty states
✅ Form validation
✅ Role-based filtering
✅ Time calculations
✅ Budget calculations

## Writing New Tests

Example test structure:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock dependencies
vi.mock('@/api/workflows');

describe('YourComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render correctly', async () => {
    render(<YourComponent />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      expect(screen.getByText('Expected Text')).toBeInTheDocument();
    });
  });
});
```

## Mocking Strategy

- **API calls**: Mocked using `vi.mock()`
- **Auth context**: Mocked with test user data
- **React Query**: Wrapped in test QueryClient
- **Toast notifications**: Mocked to prevent side effects

## Best Practices

1. Always clean up after tests with `cleanup()`
2. Use `waitFor()` for async operations
3. Mock external dependencies
4. Test user interactions, not implementation details
5. Test error states and edge cases
6. Keep tests focused and isolated
