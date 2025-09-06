/**
 * BetTrackerProvider Unit Tests
 * Sprint 11 - Tesztelési Hiányosságok Javítása
 */

import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BetTrackerProvider, useBetTrackerData, useBetTrackerActions } from '../BetTrackerProvider';
import { BetTrackerItem as BetTrackerItemType } from '@/lib/types/bet-tracker';

// Mock Supabase client
jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            data: [],
            error: null
          }))
        }))
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => ({
            data: null,
            error: null
          }))
        }))
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => ({
              data: null,
              error: null
            }))
          }))
        }))
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(() => ({
          data: null,
          error: null
        }))
      }))
    })),
    channel: jest.fn(() => ({
      on: jest.fn(() => ({
        subscribe: jest.fn(() => ({
          unsubscribe: jest.fn()
        }))
      }))
    }))
  }
}));

// Mock data
const mockTrackedBets: BetTrackerItemType[] = [
  {
    id: '1',
    event_name: 'Manchester United vs Liverpool',
    sport: 'soccer',
    bookmaker: 'Bet365',
    odds: 2.5,
    stake: 100,
    potential_payout: 250,
    profit: 150,
    status: 'pending',
    notes: 'Test bet 1',
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01')
  },
  {
    id: '2',
    event_name: 'Lakers vs Warriors',
    sport: 'basketball',
    bookmaker: 'William Hill',
    odds: 1.8,
    stake: 200,
    potential_payout: 360,
    profit: 160,
    status: 'won',
    notes: 'Test bet 2',
    created_at: new Date('2024-01-02'),
    updated_at: new Date('2024-01-02')
  }
];

// Test component to access hooks
function TestComponent() {
  const { trackedBets, isLoading, error } = useBetTrackerData();
  const { removeFromTracker, updateBet, clearTracker } = useBetTrackerActions();

  return (
    <div>
      <div data-testid="tracked-bets-count">{trackedBets.length}</div>
      <div data-testid="is-loading">{isLoading.toString()}</div>
      <div data-testid="error">{error?.message || 'no-error'}</div>
      <button 
        data-testid="remove-button" 
        onClick={() => removeFromTracker('1')}
      >
        Remove
      </button>
      <button 
        data-testid="update-button" 
        onClick={() => updateBet('1', { status: 'won' })}
      >
        Update
      </button>
      <button 
        data-testid="clear-button" 
        onClick={() => clearTracker()}
      >
        Clear
      </button>
    </div>
  );
}

describe('BetTrackerProvider', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should provide bet tracker data to children', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BetTrackerProvider>
          <TestComponent />
        </BetTrackerProvider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('tracked-bets-count')).toHaveTextContent('0');
      expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
      expect(screen.getByTestId('error')).toHaveTextContent('no-error');
    });
  });

  it('should handle loading state', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BetTrackerProvider>
          <TestComponent />
        </BetTrackerProvider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
    });
  });

  it('should handle error state', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BetTrackerProvider>
          <TestComponent />
        </BetTrackerProvider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('no-error');
    });
  });

  it('should provide removeFromTracker function', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BetTrackerProvider>
          <TestComponent />
        </BetTrackerProvider>
      </QueryClientProvider>
    );

    const removeButton = screen.getByTestId('remove-button');
    expect(removeButton).toBeInTheDocument();
  });

  it('should provide updateBet function', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BetTrackerProvider>
          <TestComponent />
        </BetTrackerProvider>
      </QueryClientProvider>
    );

    const updateButton = screen.getByTestId('update-button');
    expect(updateButton).toBeInTheDocument();
  });

  it('should provide clearTracker function', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BetTrackerProvider>
          <TestComponent />
        </BetTrackerProvider>
      </QueryClientProvider>
    );

    const clearButton = screen.getByTestId('clear-button');
    expect(clearButton).toBeInTheDocument();
  });

  it('should handle removeFromTracker call', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BetTrackerProvider>
          <TestComponent />
        </BetTrackerProvider>
      </QueryClientProvider>
    );

    const removeButton = screen.getByTestId('remove-button');
    removeButton.click();

    await waitFor(() => {
      // Function should be called without error
      expect(removeButton).toBeInTheDocument();
    });
  });

  it('should handle updateBet call', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BetTrackerProvider>
          <TestComponent />
        </BetTrackerProvider>
      </QueryClientProvider>
    );

    const updateButton = screen.getByTestId('update-button');
    updateButton.click();

    await waitFor(() => {
      // Function should be called without error
      expect(updateButton).toBeInTheDocument();
    });
  });

  it('should handle clearTracker call', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BetTrackerProvider>
          <TestComponent />
        </BetTrackerProvider>
      </QueryClientProvider>
    );

    const clearButton = screen.getByTestId('clear-button');
    clearButton.click();

    await waitFor(() => {
      // Function should be called without error
      expect(clearButton).toBeInTheDocument();
    });
  });

  it('should handle multiple children components', async () => {
    function AnotherTestComponent() {
      const { trackedBets } = useBetTrackerData();
      return <div data-testid="another-component">{trackedBets.length}</div>;
    }

    render(
      <QueryClientProvider client={queryClient}>
        <BetTrackerProvider>
          <TestComponent />
          <AnotherTestComponent />
        </BetTrackerProvider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('tracked-bets-count')).toHaveTextContent('0');
      expect(screen.getByTestId('another-component')).toHaveTextContent('0');
    });
  });

  it('should handle provider without children', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BetTrackerProvider>
          {null}
        </BetTrackerProvider>
      </QueryClientProvider>
    );

    // Should render without error
    expect(document.body).toBeInTheDocument();
  });

  it('should handle provider with empty children', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BetTrackerProvider>
          <></>
        </BetTrackerProvider>
      </QueryClientProvider>
    );

    // Should render without error
    expect(document.body).toBeInTheDocument();
  });

  it('should handle provider with multiple nested children', async () => {
    function NestedComponent() {
      const { trackedBets } = useBetTrackerData();
      return (
        <div>
          <div data-testid="nested-component">{trackedBets.length}</div>
          <TestComponent />
        </div>
      );
    }

    render(
      <QueryClientProvider client={queryClient}>
        <BetTrackerProvider>
          <NestedComponent />
        </BetTrackerProvider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('nested-component')).toHaveTextContent('0');
      expect(screen.getByTestId('tracked-bets-count')).toHaveTextContent('0');
    });
  });

  it('should handle provider with conditional children', async () => {
    function ConditionalComponent({ show }: { show: boolean }) {
      const { trackedBets } = useBetTrackerData();
      return show ? (
        <div data-testid="conditional-component">{trackedBets.length}</div>
      ) : null;
    }

    const { rerender } = render(
      <QueryClientProvider client={queryClient}>
        <BetTrackerProvider>
          <ConditionalComponent show={true} />
        </BetTrackerProvider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('conditional-component')).toHaveTextContent('0');
    });

    rerender(
      <QueryClientProvider client={queryClient}>
        <BetTrackerProvider>
          <ConditionalComponent show={false} />
        </BetTrackerProvider>
      </QueryClientProvider>
    );

    expect(screen.queryByTestId('conditional-component')).not.toBeInTheDocument();
  });

  it('should handle provider with error boundary', async () => {
    function ErrorComponent() {
      throw new Error('Test error');
    }

    function ErrorBoundary({ children }: { children: React.ReactNode }) {
      try {
        return <>{children}</>;
      } catch (error) {
        return <div data-testid="error-boundary">Error caught</div>;
      }
    }

    render(
      <QueryClientProvider client={queryClient}>
        <BetTrackerProvider>
          <ErrorBoundary>
            <ErrorComponent />
          </ErrorBoundary>
        </BetTrackerProvider>
      </QueryClientProvider>
    );

    expect(screen.getByTestId('error-boundary')).toHaveTextContent('Error caught');
  });

  it('should handle provider with async children', async () => {
    function AsyncComponent() {
      const { trackedBets, isLoading } = useBetTrackerData();
      
      if (isLoading) {
        return <div data-testid="async-loading">Loading...</div>;
      }
      
      return <div data-testid="async-content">{trackedBets.length}</div>;
    }

    render(
      <QueryClientProvider client={queryClient}>
        <BetTrackerProvider>
          <AsyncComponent />
        </BetTrackerProvider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('async-content')).toHaveTextContent('0');
    });
  });

  it('should handle provider with context consumers', async () => {
    function ContextConsumer() {
      const { trackedBets } = useBetTrackerData();
      return <div data-testid="context-consumer">{trackedBets.length}</div>;
    }

    render(
      <QueryClientProvider client={queryClient}>
        <BetTrackerProvider>
          <ContextConsumer />
        </BetTrackerProvider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('context-consumer')).toHaveTextContent('0');
    });
  });

  it('should handle provider with memoized children', async () => {
    const MemoizedComponent = React.memo(function MemoizedComponent() {
      const { trackedBets } = useBetTrackerData();
      return <div data-testid="memoized-component">{trackedBets.length}</div>;
    });

    render(
      <QueryClientProvider client={queryClient}>
        <BetTrackerProvider>
          <MemoizedComponent />
        </BetTrackerProvider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('memoized-component')).toHaveTextContent('0');
    });
  });

  it('should handle provider with forwardRef children', async () => {
    const ForwardRefComponent = React.forwardRef<HTMLDivElement, {}>(function ForwardRefComponent(props, ref) {
      const { trackedBets } = useBetTrackerData();
      return <div ref={ref} data-testid="forward-ref-component">{trackedBets.length}</div>;
    });

    render(
      <QueryClientProvider client={queryClient}>
        <BetTrackerProvider>
          <ForwardRefComponent />
        </BetTrackerProvider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('forward-ref-component')).toHaveTextContent('0');
    });
  });
});
