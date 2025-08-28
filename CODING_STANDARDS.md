# 📋 ArbitrageJam Coding Standards

Phase D fejlesztésekhez szükséges kódolási szabványok és szervezési irányelvek.

## 📁 **File Organization**

### **Directory Structure**
```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Route groups
│   ├── api/               # API routes
│   └── globals.css        # Global styles
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── auth/              # Authentication components
│   ├── analytics/         # Analytics & charts
│   ├── alerts/            # Notification system
│   ├── subscription/      # Phase D: Subscription components
│   ├── live-betting/      # Phase D: Live betting
│   ├── api-management/    # Phase D: API management
│   └── portfolio/         # Phase D: Portfolio management
├── lib/
│   ├── hooks/             # Custom React hooks
│   ├── providers/         # Context providers
│   ├── supabase/          # Database client
│   ├── types/             # TypeScript types
│   ├── utils.ts           # Utility functions
│   └── constants.ts       # App constants
└── middleware.ts          # Next.js middleware
```

### **Phase D New Directories**
```
src/components/
├── subscription/
│   ├── PricingCards.tsx
│   ├── PaymentForm.tsx
│   ├── BillingHistory.tsx
│   └── SubscriptionStatus.tsx
├── live-betting/
│   ├── LiveOddsStream.tsx
│   ├── WebSocketManager.tsx
│   ├── LiveArbitrageAlert.tsx
│   └── QuickBetPlacement.tsx
├── api-management/
│   ├── APIKeyManager.tsx
│   ├── APIDocumentation.tsx
│   ├── UsageMetrics.tsx
│   └── SDKDownload.tsx
└── portfolio/
    ├── MultiBookmakerTracker.tsx
    ├── RiskManagement.tsx
    ├── AutomatedBetting.tsx
    └── PortfolioOptimizer.tsx
```

## 🏗️ **Component Architecture**

### **Component Types**
1. **Page Components** - App router pages
2. **Layout Components** - Shared layouts
3. **Feature Components** - Business logic components
4. **UI Components** - Reusable UI elements (shadcn/ui)
5. **Provider Components** - Context providers

### **Naming Conventions**
- **Files**: PascalCase (`UserProfile.tsx`)
- **Components**: PascalCase (`UserProfile`)
- **Hooks**: camelCase with `use` prefix (`useUserProfile`)
- **Types**: PascalCase (`UserProfileType`)
- **Constants**: SCREAMING_SNAKE_CASE (`API_BASE_URL`)

### **Component Structure**
```tsx
"use client"; // Only if needed

// 1. React & Next.js imports
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// 2. Third-party imports
import { useMutation } from '@tanstack/react-query';

// 3. UI component imports
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// 4. Custom component imports
import { CustomComponent } from "@/components/custom/CustomComponent";

// 5. Hook imports
import { useAuth } from "@/lib/providers/auth-provider";
import { useCustomHook } from "@/lib/hooks/use-custom-hook";

// 6. Utility imports
import { cn, formatNumber } from "@/lib/utils";

// 7. Type imports
import type { ComponentProps } from "@/lib/types/component";

// 8. Interface definition
interface YourComponentProps {
  // Props definition
}

// 9. Component implementation
export function YourComponent({ props }: YourComponentProps) {
  // Component logic
}
```

## 🎯 **TypeScript Standards**

### **Type Definitions**
```tsx
// Prefer interfaces for object shapes
interface User {
  id: string;
  email: string;
  profile?: UserProfile;
}

// Use types for unions and computed types
type Status = 'loading' | 'success' | 'error';
type UserWithProfile = User & { profile: UserProfile };

// Generic types for reusable components
interface GenericResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}
```

### **Props with Default Values**
```tsx
interface ComponentProps {
  title: string;
  isVisible?: boolean;
  className?: string;
}

export function Component({ 
  title, 
  isVisible = true, 
  className 
}: ComponentProps) {
  // Implementation
}
```

### **Event Handler Types**
```tsx
interface FormProps {
  onSubmit: (data: FormData) => void;
  onChange?: (field: string, value: string) => void;
}
```

## 🪝 **Custom Hooks Standards**

### **Hook Structure**
```tsx
// lib/hooks/use-subscription.ts
import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';

export function useSubscription(userId: string) {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  const subscriptionQuery = useQuery({
    queryKey: ['subscription', userId],
    queryFn: () => fetchSubscription(userId),
    enabled: !!userId,
  });

  const updateSubscriptionMutation = useMutation({
    mutationFn: updateSubscription,
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['subscription', userId] });
    },
  });

  return {
    subscription: subscriptionQuery.data,
    isLoading: subscriptionQuery.isLoading,
    error: subscriptionQuery.error,
    updateSubscription: updateSubscriptionMutation.mutate,
    isUpdating: updateSubscriptionMutation.isPending,
  };
}
```

### **Hook Naming**
- **Data fetching**: `useUserData`, `useSubscriptionInfo`
- **State management**: `useToggle`, `useCounter`
- **Side effects**: `useWebSocket`, `useLocalStorage`
- **Business logic**: `useArbitrageCalculator`, `useRiskManagement`

## 🎨 **Styling Standards**

### **Tailwind CSS Classes**
```tsx
// ✅ Good - Consistent ordering
<div className="flex items-center justify-between p-4 bg-card border rounded-lg">

// ❌ Bad - Random ordering
<div className="border p-4 bg-card justify-between rounded-lg flex items-center">
```

### **Class Ordering**
1. **Layout**: `flex`, `grid`, `block`
2. **Positioning**: `relative`, `absolute`, `top-0`
3. **Size**: `w-full`, `h-screen`, `max-w-lg`
4. **Spacing**: `p-4`, `m-2`, `gap-4`
5. **Typography**: `text-lg`, `font-bold`, `text-center`
6. **Background**: `bg-primary`, `bg-gradient-to-r`
7. **Border**: `border`, `border-primary`, `rounded-lg`
8. **Effects**: `shadow-lg`, `opacity-50`, `transition-all`

### **Conditional Classes**
```tsx
// ✅ Good - Using cn utility
<Button className={cn(
  "base-classes",
  isActive && "active-classes",
  variant === 'primary' && "primary-classes"
)}>

// ❌ Bad - String concatenation
<Button className={`base-classes ${isActive ? 'active-classes' : ''}`}>
```

## 🔄 **State Management**

### **Local State**
```tsx
// Simple state
const [isOpen, setIsOpen] = useState(false);

// Complex state with reducer pattern
const [state, setState] = useState({
  data: null,
  loading: false,
  error: null,
});

// Or use useReducer for complex state
const [state, dispatch] = useReducer(reducer, initialState);
```

### **Server State (React Query)**
```tsx
// Query
const { data, isLoading, error } = useQuery({
  queryKey: ['key'],
  queryFn: fetchFunction,
});

// Mutation
const mutation = useMutation({
  mutationFn: updateFunction,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['key'] });
  },
});
```

### **Global State (Context)**
```tsx
// Only for truly global state
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

## 🚨 **Error Handling**

### **Component Error Boundaries**
```tsx
try {
  // Risky operation
} catch (error) {
  console.error('Operation failed:', error);
  setError(error instanceof Error ? error.message : 'Unknown error');
}
```

### **Async Error Handling**
```tsx
const handleSubmit = async (data: FormData) => {
  try {
    setLoading(true);
    await submitData(data);
    setSuccess(true);
  } catch (error) {
    setError(error instanceof Error ? error.message : 'Submission failed');
  } finally {
    setLoading(false);
  }
};
```

## 📝 **Comments & Documentation**

### **Component Documentation**
```tsx
/**
 * Subscription pricing card component for Phase D
 * 
 * @param tier - Subscription tier data
 * @param onSelect - Callback when tier is selected
 * @param className - Additional CSS classes
 */
export function SubscriptionCard({ tier, onSelect, className }: SubscriptionCardProps) {
  // Implementation
}
```

### **Complex Logic Comments**
```tsx
// Calculate Kelly Criterion stake size
// Formula: f = (bp - q) / b
// where b = odds-1, p = win probability, q = lose probability
const kellyStake = useMemo(() => {
  const b = odds - 1;
  const p = winProbability;
  const q = 1 - p;
  return (b * p - q) / b;
}, [odds, winProbability]);
```

## ⚡ **Performance Best Practices**

### **Memoization**
```tsx
// Expensive calculations
const expensiveValue = useMemo(() => {
  return calculateComplexValue(data);
}, [data]);

// Callback functions
const handleClick = useCallback((id: string) => {
  onItemClick(id);
}, [onItemClick]);

// Component memoization
const MemoizedComponent = memo(function Component({ props }) {
  return <div>{props.content}</div>;
});
```

### **Lazy Loading**
```tsx
// Dynamic imports
const LazyComponent = lazy(() => import('./LazyComponent'));

// Conditional rendering
{showComponent && <ExpensiveComponent />}
```

## 🧪 **Testing Standards**

### **Test File Naming**
- Unit tests: `Component.test.tsx`
- Integration tests: `feature.integration.test.tsx`
- E2E tests: `flow.e2e.test.tsx`

### **Test Structure**
```tsx
describe('SubscriptionCard', () => {
  it('should display tier information correctly', () => {
    // Test implementation
  });

  it('should handle tier selection', () => {
    // Test implementation
  });

  describe('when tier is popular', () => {
    it('should show popular badge', () => {
      // Test implementation
    });
  });
});
```

## 🔧 **Development Tools**

### **ESLint Rules**
- Consistent import ordering
- Unused variable detection
- React hooks rules
- TypeScript strict mode

### **Biome Formatting**
- 2-space indentation
- Single quotes for strings
- Trailing commas
- Line length: 100 characters

### **Git Commit Messages**
```
feat(subscription): add pricing cards component
fix(auth): resolve login redirect issue
docs(api): update endpoint documentation
refactor(hooks): simplify data fetching logic
```

## 📋 **Code Review Checklist**

### **Before Submitting PR**
- [ ] All TypeScript errors resolved
- [ ] Components follow design system
- [ ] Proper error handling implemented
- [ ] Loading states handled
- [ ] Responsive design tested
- [ ] Accessibility considered
- [ ] Performance optimized

### **Code Quality**
- [ ] Single responsibility principle
- [ ] DRY (Don't Repeat Yourself)
- [ ] Consistent naming conventions
- [ ] Proper TypeScript types
- [ ] Clean component structure

---

**📋 Ezek a szabványok biztosítják a Phase D fejlesztések konzisztenciáját és minőségét!**
