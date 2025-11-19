# Project Structure & Architecture

## 📁 Directory Organization

```
src/
├── api/              # API client modules (organized by domain)
├── components/       # Reusable UI components
│   ├── ui/          # Base UI components (shadcn)
│   ├── AppSidebar.tsx
│   └── NavLink.tsx
├── contexts/        # React context providers
├── features/        # Feature-based modules
├── hooks/           # Custom React hooks
│   ├── useApiQuery.ts      # Unified data fetching
│   └── useApiMutation.ts   # Unified mutations
├── lib/             # Core utilities
│   ├── api-client.ts       # Axios instance with interceptors
│   ├── format-utils.ts     # Data formatting utilities
│   └── utils.ts
├── modules/         # Domain-specific modules
├── pages/           # Route pages
└── styles/          # Global styles
```

## 🔧 Core Utilities

### API Client (`lib/api-client.ts`)
- Centralized Axios instance with authentication
- Automatic error handling with toast notifications
- Request/response interceptors
- Token management

### Format Utilities (`lib/format-utils.ts`)
Prevents "[object Object]" display issues:
- `formatCurrency(amount)` - Format money values
- `formatNumber(num)` - Format large numbers with commas
- `formatDate(date)` - Human-readable dates
- `formatDateTime(date)` - Full timestamp formatting
- `formatRelativeTime(date)` - "2h ago", "Just now", etc.
- `formatPercentage(value, decimals)` - Percentage display
- `formatStatus(status)` - Pretty status names
- `formatObject(obj)` - Safe object to string conversion
- `truncate(str, length)` - Truncate long text

### Custom Hooks

#### `useApiQuery`
```typescript
import { useApiQuery } from '@/hooks/useApiQuery';

const { data, isLoading, error } = useApiQuery({
  queryKey: ['users', userId],
  queryFn: () => userApi.getUser(userId),
});
```

Features:
- Automatic error handling
- Smart retry logic (no retry on 4xx errors)
- 30s stale time default
- TypeScript support

#### `useApiMutation`
```typescript
import { useApiMutation } from '@/hooks/useApiMutation';

const createUser = useApiMutation({
  mutationFn: (data) => userApi.create(data),
  successMessage: 'User created successfully!',
  invalidateKeys: [['users']],
  onSuccess: (data) => {
    // Custom success handler
  },
});

createUser.mutate({ name: 'John' });
```

Features:
- Automatic success toasts
- Query invalidation
- Error handling via interceptor
- TypeScript support

## 🎨 Navigation & Layout

### Sidebar (`components/AppSidebar.tsx`)
- Role-based menu rendering
- Active route highlighting
- Collapsible with icon-only mode
- Menu groups support

### NavLink Component
```typescript
<NavLink to="/dashboard" activeClassName="bg-accent">
  Dashboard
</NavLink>
```
- Automatic active state detection
- Customizable active styles
- Support for exact and partial matches

## 📝 Usage Examples

### Fetching Data
```typescript
import { useApiQuery } from '@/hooks/useApiQuery';
import { formatCurrency, formatDate } from '@/lib/format-utils';

function BudgetList() {
  const { data: budgets } = useApiQuery({
    queryKey: ['budgets'],
    queryFn: () => api.budgets.list(),
  });

  return (
    <div>
      {budgets?.map(budget => (
        <div key={budget.id}>
          <h3>{budget.name}</h3>
          <p>Amount: {formatCurrency(budget.amount)}</p>
          <p>Created: {formatDate(budget.created_at)}</p>
        </div>
      ))}
    </div>
  );
}
```

### Creating/Updating Data
```typescript
import { useApiMutation } from '@/hooks/useApiMutation';

function CreateBudgetForm() {
  const create = useApiMutation({
    mutationFn: (data) => api.budgets.create(data),
    successMessage: 'Budget created!',
    invalidateKeys: [['budgets']],
  });

  const handleSubmit = (formData) => {
    create.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <button disabled={create.isPending}>
        {create.isPending ? 'Creating...' : 'Create'}
      </button>
    </form>
  );
}
```

### Displaying Complex Data
```typescript
import { formatObject, formatStatus } from '@/lib/format-utils';

// Before (shows [object Object])
<div>{data.user}</div>

// After (shows properly formatted data)
<div>{formatObject(data.user)}</div>

// Status formatting
<span>{formatStatus(data.status)}</span>
// "pending_approval" → "Pending Approval"
```

## 🔐 Error Handling

All API errors are handled automatically by the `api-client` interceptor:
- **400**: Invalid Request - shows validation errors
- **401**: Unauthorized - redirects to login
- **403**: Forbidden - shows access denied message
- **404**: Not Found - shows not found message
- **500**: Server Error - shows generic error
- **Network**: Shows connection error

## 🎯 Best Practices

1. **Always use format utilities** to display data
2. **Use `useApiQuery`** for GET requests
3. **Use `useApiMutation`** for POST/PUT/DELETE requests
4. **Define API clients** in separate files under `src/api/`
5. **Leverage query invalidation** to auto-refresh data after mutations
6. **Use TypeScript** for type safety on all API calls
7. **Keep components focused** - separate logic into custom hooks
8. **Use NavLink** for all navigation to get active states

## 🚀 Migration Guide

### Old Pattern
```typescript
// ❌ Manual error handling, no types, shows [object Object]
const [data, setData] = useState();
const [loading, setLoading] = useState(false);

const fetchData = async () => {
  setLoading(true);
  try {
    const res = await axios.get('/api/users');
    setData(res.data);
  } catch (err) {
    alert('Error: ' + err);
  } finally {
    setLoading(false);
  }
};

return <div>{data}</div>; // Shows [object Object]
```

### New Pattern
```typescript
// ✅ Automatic error handling, types, proper formatting
const { data, isLoading } = useApiQuery({
  queryKey: ['users'],
  queryFn: () => userApi.list(),
});

return <div>{formatObject(data)}</div>; // Shows properly formatted
```

---

## 🔌 Backend API Requirements

The following backend APIs need to be implemented to support the frontend menu management functionality:

### Menu Management APIs

#### Menu Items CRUD
- **GET** `/api/v1/menus/items` - List all menu items
- **GET** `/api/v1/menus/items/{id}` - Get single menu item
- **POST** `/api/v1/menus/items` - Create menu item
  ```json
  {
    "key": "dashboard",
    "label": "Dashboard",
    "path": "/dashboard",
    "icon": "Home",
    "parent_id": null,
    "order_index": 0
  }
  ```
- **PATCH** `/api/v1/menus/items/{id}` - Update menu item
- **DELETE** `/api/v1/menus/items/{id}` - Delete menu item
- **POST** `/api/v1/menus/items/reorder` - Reorder menu items
  ```json
  {
    "updates": [
      { "id": 1, "order_index": 0 },
      { "id": 2, "order_index": 1 }
    ]
  }
  ```

#### Role-Menu Assignments
- **GET** `/api/v1/menus/roles` - Get all role-menu assignments (MenusByRole object)
- **GET** `/api/v1/menus/roles/{role}` - Get menus for specific role
- **POST** `/api/v1/menus/roles/assign` - Assign menu to role
  ```json
  {
    "role_name": "admin",
    "menu_item_id": 1
  }
  ```
- **DELETE** `/api/v1/menus/roles/assign/{id}` - Remove menu from role
- **POST** `/api/v1/menus/roles/bulk-assign` - Bulk assign menus to role
  ```json
  {
    "role_name": "admin",
    "menu_item_ids": [1, 2, 3, 4]
  }
  ```
- **GET** `/api/v1/menus/available-roles` - Get list of available role names

#### User Menu Endpoint (Already Exists)
- **GET** `/api/v1/users/me/menu` - Get current user's menu based on their role

### Database Schema

```sql
-- Menu Items Table
CREATE TABLE menu_items (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    label VARCHAR(200) NOT NULL,
    path VARCHAR(500) NOT NULL,
    icon VARCHAR(50),
    parent_id INTEGER REFERENCES menu_items(id) ON DELETE CASCADE,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Role Menu Assignments Table
CREATE TABLE role_menu_assignments (
    id SERIAL PRIMARY KEY,
    role_name VARCHAR(100) NOT NULL,
    menu_item_id INTEGER NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(role_name, menu_item_id)
);

-- Indexes
CREATE INDEX idx_menu_items_parent ON menu_items(parent_id);
CREATE INDEX idx_menu_items_order ON menu_items(order_index);
CREATE INDEX idx_role_menu_role ON role_menu_assignments(role_name);
CREATE INDEX idx_role_menu_item ON role_menu_assignments(menu_item_id);
```

### Implementation Notes

1. **Menu Hierarchy**: Menu items support parent-child relationships via `parent_id`
2. **Ordering**: Use `order_index` to control display order (lower numbers first)
3. **Role Assignment**: Multiple menu items can be assigned to each role
4. **User Context**: `/api/v1/users/me/menu` returns menus based on authenticated user's role(s)
5. **Cascading Deletes**: When a parent menu is deleted, child menus are also deleted
6. **Validation**: Prevent circular parent references
7. **Icons**: Use Lucide icon names (e.g., "Home", "Users", "Settings")

### Frontend Usage

The menu management interface is available at `/admin/menu-management` for administrators:
- Create and organize menu items with drag-and-drop ordering
- Define parent-child relationships for nested menus
- Assign menu items to roles with bulk operations
- Preview role-specific menu configurations
