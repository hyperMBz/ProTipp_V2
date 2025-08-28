# 🔌 API Integration Guide

## Overview
ProTipp V2 integrates with multiple APIs and services for real-time sports betting data, user authentication, and database operations.

## Architecture Overview

### Data Flow
```
External APIs → API Clients → React Query Hooks → Components
     ↓              ↓              ↓              ↓
- Odds API      odds-api.ts   use-odds-data.ts  UI Components
- Supabase      client.ts     auth-provider.tsx  Auth Components
```

## 🎯 **The Odds API Integration**

### Configuration
```typescript
// Environment Variables Required
NEXT_PUBLIC_ODDS_API_KEY=your_api_key_here
ODDS_API_BASE_URL=https://api.the-odds-api.com/v4
```

### Client Setup
The `OddsApiClient` class handles all external API communication:
- **Rate limiting**: 1 second delay between requests
- **Error handling**: 429 (rate limit) and 401 (auth) specific handling
- **Response transformation**: Raw API data → ProcessedOddsData
- **Arbitrage calculation**: Built-in opportunity detection

### Core Methods

#### Get Available Sports
```typescript
const sports = await oddsApiClient.getSports();
// Returns: OddsApiSport[]
```

#### Get Odds Data
```typescript
const odds = await oddsApiClient.getOdds(
  'soccer_epl',           // Sport key
  ['h2h'],                // Markets (head-to-head)
  ['us', 'eu'],           // Regions
  'decimal',              // Odds format
  'iso'                   // Date format
);
```

#### Calculate Arbitrage
```typescript
const processed = oddsApiClient.calculateArbitrage(events);
// Automatically finds profitable opportunities
```

### React Query Integration

#### Basic Usage Hook
```typescript
export function useOdds(sport: string, enabled: boolean = true) {
  return useQuery({
    queryKey: QUERY_KEYS.ODDS(sport),
    queryFn: () => oddsApiClient.getOdds(sport, ['h2h'], ['us', 'eu']),
    staleTime: 30 * 1000,        // 30 seconds
    refetchInterval: 60 * 1000,   // Auto-refresh every minute
    enabled: enabled && !!process.env.NEXT_PUBLIC_ODDS_API_KEY,
  });
}
```

#### Multiple Sports Hook
```typescript
export function useMultipleSportsOdds(sports: string[]) {
  return useQueries({
    queries: sports.map(sport => ({
      queryKey: QUERY_KEYS.ODDS(sport),
      queryFn: () => oddsApiClient.getOdds(sport),
      staleTime: 30 * 1000,
      refetchInterval: 60 * 1000,
    })),
  });
}
```

#### Arbitrage Opportunities Hook
```typescript
export function useArbitrageOpportunities(sports: string[]) {
  return useQuery({
    queryKey: QUERY_KEYS.ARBITRAGE(sports),
    queryFn: () => fetchArbitrageOpportunities(sports),
    staleTime: 30 * 1000,
    refetchInterval: 45 * 1000,
    select: (data) => transformToArbitrageOpportunities(data),
  });
}
```

### Error Handling Patterns

#### API Client Level
```typescript
// Response interceptor in OddsApiClient
this.client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 429) {
      console.error('Rate limit exceeded. Consider upgrading your plan.');
    } else if (error.response?.status === 401) {
      console.error('Invalid API key. Please check your configuration.');
    }
    return Promise.reject(error);
  }
);
```

#### Component Level
```typescript
const { data, error, isLoading, isError } = useArbitrageOpportunities(selectedSports);

if (isError) {
  return <div>Error loading data: {error.message}</div>;
}

if (isLoading) {
  return <LoadingSpinner />;
}
```

### Mock Data Fallback
```typescript
export function useArbitrageWithFallback(sports: string[]) {
  const { isRealTime } = useRealTimeStatus();
  const realDataQuery = useArbitrageOpportunities(sports);
  const mockDataQuery = useQuery({
    queryKey: ['mock-arbitrage'],
    queryFn: () => import('@/lib/mock-data').then(m => m.mockArbitrageOpportunities),
    enabled: !isRealTime,
  });

  return isRealTime ? realDataQuery : mockDataQuery;
}
```

## 🗄️ **Supabase Database Integration**

### Client Configuration
```typescript
// Client-side (components)
export const createSupabaseClient = () => {
  return createClientComponentClient<Database>();
};

// Server-side (admin operations)
export const createSupabaseAdminClient = () => {
  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
};
```

### Database Schema Types
```typescript
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          subscription_tier: 'free' | 'pro' | 'premium';
          bankroll: number;
          // ... other fields
        };
      };
      bet_history: {
        Row: {
          id: string;
          user_id: string;
          event_name: string;
          stake: number;
          status: 'pending' | 'won' | 'lost' | 'refunded' | 'cancelled';
          // ... other fields
        };
      };
    };
  };
}
```

### Authentication Patterns

#### Auth Provider Setup
```typescript
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_IN') {
          await ensureUserProfile(session.user);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);
}
```

#### Authentication Methods
```typescript
// Sign up
const signUp = async (email: string, password: string) => {
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  return { error };
};

// Sign in
const signIn = async (email: string, password: string) => {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { error };
};

// OAuth (Google)
const signInWithGoogle = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  return { error };
};
```

### Database Operations

#### Profile Management
```typescript
// Ensure user profile exists
const ensureUserProfile = async (user: User) => {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error && error.code === 'PGRST116') {
    // Create profile if doesn't exist
    await supabase.from('profiles').insert({
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || '',
    });
  }
};
```

#### Bet History Operations
```typescript
// Add new bet
const addBet = async (betData: Database['public']['Tables']['bet_history']['Insert']) => {
  const { data, error } = await supabase
    .from('bet_history')
    .insert(betData)
    .select()
    .single();

  return { data, error };
};

// Get user's bet history
const getBetHistory = async (userId: string) => {
  const { data, error } = await supabase
    .from('bet_history')
    .select('*')
    .eq('user_id', userId)
    .order('placed_at', { ascending: false });

  return { data, error };
};
```

### Real-time Subscriptions
```typescript
// Subscribe to bet history changes
useEffect(() => {
  if (!user) return;

  const subscription = supabase
    .channel('bet_history_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'bet_history',
        filter: `user_id=eq.${user.id}`,
      },
      (payload) => {
        // Handle real-time updates
        console.log('Bet history updated:', payload);
      }
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}, [user]);
```

## 🔧 **Custom Hooks Patterns**

### Data Fetching Hook Template
```typescript
export function useCustomData<T>(
  queryKey: string[],
  queryFn: () => Promise<T>,
  options?: {
    enabled?: boolean;
    staleTime?: number;
    refetchInterval?: number;
  }
) {
  return useQuery({
    queryKey,
    queryFn,
    staleTime: options?.staleTime ?? 5 * 60 * 1000,
    enabled: options?.enabled ?? true,
    refetchInterval: options?.refetchInterval,
  });
}
```

### Mutation Hook Template
```typescript
export function useCustomMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: {
    onSuccess?: (data: TData) => void;
    onError?: (error: Error) => void;
  }
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: (data) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['related-data'] });
      options?.onSuccess?.(data);
    },
    onError: options?.onError,
  });
}
```

## ⚡ **Performance Best Practices**

### Query Optimization
```typescript
// Use select to transform data
const { data } = useQuery({
  queryKey: ['odds', sport],
  queryFn: () => fetchOdds(sport),
  select: (data) => data.filter(event => event.profitMargin > 0), // Only profitable opportunities
});

// Parallel queries for better performance
const queries = useQueries({
  queries: sports.map(sport => ({
    queryKey: ['odds', sport],
    queryFn: () => fetchOdds(sport),
  })),
});
```

### Caching Strategy
```typescript
const QUERY_KEYS = {
  SPORTS: ['sports'] as const,                    // Cache for 24 hours
  ODDS: (sport: string) => ['odds', sport],       // Cache for 30 seconds
  ARBITRAGE: (sports: string[]) => ['arbitrage', ...sports], // Cache for 30 seconds
  USER_PROFILE: (userId: string) => ['profile', userId],     // Cache for 5 minutes
} as const;
```

### Error Boundaries
```typescript
// API Error Boundary Component
function APIErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={<div>Something went wrong with the API. Please try again.</div>}
      onError={(error) => {
        console.error('API Error:', error);
        // Send to error reporting service
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
```

## 🔒 **Security Guidelines**

### Environment Variables
```bash
# Required for production
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Required for live data
NEXT_PUBLIC_ODDS_API_KEY=your_odds_api_key
ODDS_API_BASE_URL=https://api.the-odds-api.com/v4
```

### API Key Protection
- Never expose service role keys in client code
- Use Row Level Security (RLS) in Supabase
- Validate API responses before processing
- Implement rate limiting on client side

### Data Validation
```typescript
// Validate API responses
const validateOddsData = (data: unknown): data is OddsApiEvent[] => {
  return Array.isArray(data) && data.every(event => 
    typeof event.id === 'string' &&
    typeof event.sport_key === 'string' &&
    Array.isArray(event.bookmakers)
  );
};
```

## 📊 **Monitoring & Analytics**

### API Usage Tracking
```typescript
export function useApiUsage() {
  return useQuery({
    queryKey: ['usage-stats'],
    queryFn: () => oddsApiClient.getUsageStats(),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}
```

### Error Logging
```typescript
// Log API errors for monitoring
const logApiError = (error: Error, context: string) => {
  console.error(`API Error in ${context}:`, {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
  });
  
  // Send to monitoring service (e.g., Sentry)
  // Sentry.captureException(error, { tags: { context } });
};
```

---

**🔌 This API guide provides comprehensive patterns for integrating external services while maintaining performance, security, and reliability in ProTipp V2.**
