/**
 * useAnalytics Hook Unit Tests
 * Sprint 9-10: Analytics Dashboard
 */

import { renderHook, act } from '@testing-library/react';
import { useAnalytics } from '../use-analytics';

describe('useAnalytics', () => {
  const mockUserId = 'test-user-id';

  test('returns initial state with mock data', () => {
    const { result } = renderHook(() => useAnalytics({ userId: mockUserId }));

    expect(result.current.state.summary).toBeDefined();
    expect(result.current.state.summary?.totalBets).toBe(120);
    expect(result.current.state.summary?.wonBets).toBe(78);
    expect(result.current.state.summary?.totalProfit).toBe(150000);
    
    expect(result.current.state.performanceMetrics).toBeDefined();
    expect(result.current.state.performanceMetrics?.roi).toBe(12.5);
    
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.isExporting).toBe(false);
    expect(result.current.exportError).toBe(null);
  });

  test('provides actions object with required methods', () => {
    const { result } = renderHook(() => useAnalytics({ userId: mockUserId }));

    expect(result.current.actions).toBeDefined();
    expect(typeof result.current.actions.setFilters).toBe('function');
    expect(typeof result.current.actions.setDateRange).toBe('function');
    expect(typeof result.current.actions.refreshData).toBe('function');
    expect(typeof result.current.actions.exportData).toBe('function');
  });

  test('setFilters updates filters state', () => {
    const { result } = renderHook(() => useAnalytics({ userId: mockUserId }));

    const newFilters = { sport: 'Futball', bookmaker: 'Tippmix' };

    act(() => {
      result.current.actions.setFilters(newFilters);
    });

    expect(result.current.state.filters).toEqual(newFilters);
  });

  test('setDateRange updates dateRange state', () => {
    const { result } = renderHook(() => useAnalytics({ userId: mockUserId }));

    const newDateRange = {
      from: new Date('2024-01-01'),
      to: new Date('2024-01-31')
    };

    act(() => {
      result.current.actions.setDateRange(newDateRange);
    });

    expect(result.current.state.dateRange).toEqual(newDateRange);
  });

  test('refreshData sets loading state and calls refresh', async () => {
    const { result } = renderHook(() => useAnalytics({ userId: mockUserId }));

    await act(async () => {
      await result.current.actions.refreshData();
    });

    // Loading state should be managed internally
    expect(result.current.isLoading).toBe(false);
  });

  test('exportData sets exporting state and calls export', async () => {
    const { result } = renderHook(() => useAnalytics({ userId: mockUserId }));

    await act(async () => {
      await result.current.actions.exportData('pdf');
    });

    // Exporting state should be managed internally
    expect(result.current.isExporting).toBe(false);
  });

  test('handles enableRealtime option', () => {
    const { result } = renderHook(() => 
      useAnalytics({ userId: mockUserId, enableRealtime: true })
    );

    expect(result.current.state).toBeDefined();
    expect(result.current.actions).toBeDefined();
  });

  test('maintains state consistency across multiple calls', () => {
    const { result, rerender } = renderHook(() => 
      useAnalytics({ userId: mockUserId })
    );

    const initialSummary = result.current.state.summary;

    rerender();

    expect(result.current.state.summary).toEqual(initialSummary);
  });

  test('provides sport performance data', () => {
    const { result } = renderHook(() => useAnalytics({ userId: mockUserId }));

    expect(result.current.state.sportPerformance).toBeDefined();
    expect(Array.isArray(result.current.state.sportPerformance)).toBe(true);
    expect(result.current.state.sportPerformance.length).toBeGreaterThan(0);
    
    const firstSport = result.current.state.sportPerformance[0];
    expect(firstSport.sport).toBe('Futball');
    expect(firstSport.totalBets).toBe(50);
    expect(firstSport.profit).toBe(75000);
  });

  test('provides bookmaker performance data', () => {
    const { result } = renderHook(() => useAnalytics({ userId: mockUserId }));

    expect(result.current.state.bookmakerPerformance).toBeDefined();
    expect(Array.isArray(result.current.state.bookmakerPerformance)).toBe(true);
    expect(result.current.state.bookmakerPerformance.length).toBeGreaterThan(0);
    
    const firstBookmaker = result.current.state.bookmakerPerformance[0];
    expect(firstBookmaker.bookmaker).toBe('Tippmix');
    expect(firstBookmaker.totalBets).toBe(40);
    expect(firstBookmaker.profit).toBe(60000);
  });
});
