# Frontend Integration Quick Reference

## 🚀 Quick Start Checklist

### Initial Setup
- [x] Install axios: Already installed
- [ ] Install date-fns (optional): `npm install date-fns`
- [x] Create `src/config/api.config.ts` - Using existing apiClient
- [x] Create `src/contexts/AuthContext.tsx` - ✅ Complete with RBAC v2
- [x] Create `src/types/api.types.ts` - Using TypeScript interfaces
- [ ] Create `src/utils/validation.ts`
- [ ] Create `src/utils/format.ts`
- [ ] Create `src/utils/errorHandler.ts`

### Environment Variables (.env)
```
VITE_API_URL=http://localhost:8000
```

---

## 📞 API Endpoints Quick Reference

### Authentication
```
POST   /api/v1/auth/login          # Login (form data)
POST   /api/v1/auth/register       # Register
GET    /api/v1/auth/me             # Get current user (with RBAC v2 data)
```

### RBAC v2
```
GET    /api/v1/rbac/check?permission={name}           # Check single permission
POST   /api/v1/rbac/check-batch                       # Check multiple permissions  
GET    /api/v1/rbac/my-permissions                    # Get all user permissions
```

### HR Management
```
GET    /api/v1/hr/employees                           # List employees
POST   /api/v1/hr/employees                           # Create employee
GET    /api/v1/hr/employees/{id}                      # Get employee
PATCH  /api/v1/hr/employees/{id}/toggle-status        # Toggle status

POST   /api/v1/hr/rate-cards                          # Create rate card
GET    /api/v1/hr/rate-cards/{employee_id}            # Get employee rate cards

POST   /api/v1/hr/payouts/calculate                   # Calculate payout
GET    /api/v1/hr/payouts/pending                     # Get pending payouts
POST   /api/v1/hr/payouts/{id}/approve                # Approve payout
POST   /api/v1/hr/payouts/{id}/mark-paid              # Mark as paid

POST   /api/v1/hr/attendance                          # Record attendance
GET    /api/v1/hr/attendance/{employee_id}            # Get attendance

POST   /api/v1/hr/complaints                          # Record complaint
GET    /api/v1/hr/complaints/pending                  # Get pending complaints
POST   /api/v1/hr/complaints/{id}/investigate         # Investigate complaint

GET    /api/v1/hr/reports/payroll-summary             # Payroll summary
GET    /api/v1/hr/reports/employee-performance/{id}   # Performance report
```

### Inventory
```
GET    /api/v1/inventory/suppliers                    # List suppliers
POST   /api/v1/inventory/suppliers                    # Create supplier

GET    /api/v1/inventory/products                     # List products
POST   /api/v1/inventory/products                     # Create product
GET    /api/v1/inventory/products/{id}                # Get product
PATCH  /api/v1/inventory/products/{id}                # Update product
```

### Finance
```
POST   /api/v1/finance/budget-usages/{id}/approve     # Approve budget usage
POST   /api/v1/finance/tasks/{id}/detect-variances    # Detect variances
POST   /api/v1/finance/variances/{id}/approve         # Approve variance
GET    /api/v1/finance/variances/pending              # Get pending variances
GET    /api/v1/finance/projects/{id}/financials       # Project financials
```

### Invoices (RBAC v2 Integrated)
```
POST   /api/v1/finance/invoices/generate              # Generate invoice
GET    /api/v1/finance/payments/overdue               # Get overdue invoices
POST   /api/v1/finance/payments/process               # Process payment
```

### Scrapers
```
POST   /api/v1/scrapers/suppliers/{id}/scrape         # Trigger scraper
POST   /api/v1/scrapers/scrape-all                    # Scrape all suppliers
GET    /api/v1/scrapers/price-history/{id}            # Price history
GET    /api/v1/scrapers/price-drops                   # Recent price drops
```

---

## 🔑 Required Headers

### For Login (OAuth2 Form)
```typescript
headers: {
  'Content-Type': 'application/x-www-form-urlencoded'
}
```

### For All Other Requests
```typescript
headers: {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer {access_token}'
}
```

---

## 📝 Data Format Requirements

### Dates
- **API Format:** `YYYY-MM-DD` (e.g., `2025-11-25`)
- **DateTime Format:** ISO 8601 (e.g., `2025-11-25T10:30:00Z`)

### Phone Numbers
- **Format:** `+254712345678` or `0712345678`
- **Pattern:** `/^(\+254|0)[17]\d{8}$/`

### Email
- **Pattern:** `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`

### Employee Code
- **Format:** `EMP00001` (EMP + 5 digits)
- **Pattern:** `/^EMP\d{5}$/`

### Password Requirements
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character

### Currency
- **Type:** Number (not string)
- **Example:** `50000.00` (not `"50000"`)

---

## ✅ Common Validation Patterns

```typescript
// Email
const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// Phone (Kenya)
const isValid = /^(\+254|0)[17]\d{8}$/.test(phone);

// Date (YYYY-MM-DD)
const isValid = /^\d{4}-\d{2}-\d{2}$/.test(dateStr);

// Password strength
const isStrong = password.length >= 8 &&
                 /[A-Z]/.test(password) &&
                 /[a-z]/.test(password) &&
                 /[0-9]/.test(password) &&
                 /[!@#$%^&*]/.test(password);

// Employee code
const isValid = /^EMP\d{5}$/.test(code);
```

---

## 🚨 Error Response Formats

### Validation Error (422)
```json
{
  "detail": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### Simple Error (400, 403, 404, 500)
```json
{
  "detail": "Error message here"
}
```

### Handling in Code
```typescript
try {
  const response = await apiClient.post('/endpoint', data);
} catch (error) {
  if (error.response?.data?.detail) {
    if (Array.isArray(error.response.data.detail)) {
      // Validation errors
      error.response.data.detail.forEach(err => {
        console.log(`${err.field}: ${err.message}`);
      });
    } else {
      // Simple error message
      console.log(error.response.data.detail);
    }
  }
}
```

---

## 🔒 Permission Names (RBAC v2)

See [permissions.ts](file:///c:/Users/elija/OneDrive/Desktop/ERP-main%20(6)/isp-opus-forge-main/src/constants/permissions.ts) for complete list.

### Key Permissions

**User Management**
- `user:read:all`, `user:create:all`, `user:update:all`, `user:delete:all`

**Employee Management**
- `employee:read:all`, `employee:create:all`, `employee:update:all`

**Finance**
- `budget:approve:all`, `variance:approve:all`, `payout:approve:all`

**Invoices** (Implemented)
- `invoice:create:all`, `invoice:read:all`, `invoice:approve:all`, `invoice:process_payment:all`

**Projects**
- `project:read:all`, `project:create:all`, `project:update:all`, `project:delete:all`

---

## 🎯 Common Patterns

### Login Flow
```typescript
1. POST /auth/login (form data)
2. Store access_token and refresh_token
3. GET /auth/me (with Bearer token) - Returns RBAC v2 data
4. Store user info with permissions_v2
5. Navigate to dashboard
```

### Permission Check Pattern (RBAC v2)
```typescript
// Using PermissionGate
<PermissionGate permission="employee:create:all">
  <CreateButton />
</PermissionGate>

// Using hook
const { hasPermission } = usePermission('employee:create:all');

// Using AuthContext
const { hasPermission } = useAuth();
if (hasPermission('employee:create:all')) {
  // Show UI
}
```

### Create Employee Flow
```typescript
1. Check permission: employee:create:all
2. Validate form data
3. Format date: YYYY-MM-DD
4. POST /hr/employees
5. Handle success/error
6. Navigate to employee detail
```

---

## 💡 Quick Tips

1. **Always validate on frontend** before sending to API
2. **Format dates** using helpers
3. **Handle all error cases** (401, 403, 404, 422, 500)
4. **Use TypeScript types** for type safety ✅ Done
5. **Check permissions** before showing UI elements ✅ PermissionGate
6. **Store tokens** in localStorage ✅ Done
7. **Auto-refresh tokens** when they expire (401)
8. **Show loading states** during API calls
9. **Provide user feedback** with toast ✅ Using sonner
10. **Test with both v1 and v2 RBAC** users ✅ Supported

---

## 📦 Installed Packages

```bash
# Already installed
✅ axios (via apiClient)
✅ react-router-dom
✅ sonner (toast notifications)
✅ @tanstack/react-query
✅ lucide-react (icons)
✅ jspdf, jspdf-autotable (PDF generation)

# Optional additions
npm install date-fns           # Date handling
npm install react-hook-form    # Form validation
npm install yup                # Schema validation
```

---

## 🧪 Testing Checklist

RBAC v2 Integration Status:

- [x] Login with valid credentials
- [x] Get current user info (both v1 and v2)
- [x] Check permissions (granted and denied)
- [x] Permission-based route protection
- [x] Permission-based UI rendering
- [x] Loading states
- [x] Success notifications
- [x] Backward compatibility (v1 fallback)

Still to test:
- [ ] Login with invalid credentials (error handling)
- [ ] Register new user
- [ ] Create employee profile
- [ ] List employees with filters
- [ ] Calculate payout
- [ ] Record attendance
- [ ] Token expiration handling
- [ ] Network error handling
- [ ] Validation error display

---

## 🎯 Next Steps

1. **Create utility files**: validation.ts, format.ts, errorHandler.ts
2. **Migrate remaining modules** to RBAC v2:
   - Projects
   - Tasks
   - Workflows
   - Finance
   - HR
   - Procurement
3. **Update navigation menus** with permission checks
4. **Add comprehensive error handling**
5. **Implement token refresh logic**

---

**RBAC v2 Status**: ✅ Core infrastructure complete, Invoice module migrated

See [walkthrough.md](file:///C:/Users/elija/.gemini/antigravity/brain/49cb26af-91bc-400f-b911-c88074155d1f/walkthrough.md) for detailed implementation.
