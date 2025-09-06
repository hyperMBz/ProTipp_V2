/**
 * AnalyticsFilters Unit Tests
 * Sprint 11 - Tesztelési Hiányosságok Javítása
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AnalyticsFilters } from '../AnalyticsFilters';
import { AnalyticsFilters as AnalyticsFiltersType } from '@/lib/types/analytics';

// Mock data
const mockFilters: AnalyticsFiltersType = {
  dateRange: {
    start: new Date('2024-01-01'),
    end: new Date('2024-01-31')
  },
  sports: ['soccer', 'basketball'],
  bookmakers: ['Bet365', 'William Hill'],
  minProfit: 100,
  maxProfit: 5000,
  minStake: 50,
  maxStake: 2000,
  status: ['won', 'lost'],
  sortBy: 'date',
  sortOrder: 'desc'
};

const mockOnFiltersChange = jest.fn();
const mockOnReset = jest.fn();

describe('AnalyticsFilters', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render analytics filters with correct title', () => {
    render(
      <AnalyticsFilters 
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        onReset={mockOnReset}
      />
    );

    expect(screen.getByText('Szűrők')).toBeInTheDocument();
  });

  it('should render all filter sections', () => {
    render(
      <AnalyticsFilters 
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        onReset={mockOnReset}
      />
    );

    expect(screen.getByText('Dátum Tartomány')).toBeInTheDocument();
    expect(screen.getByText('Sportok')).toBeInTheDocument();
    expect(screen.getByText('Fogadóirodák')).toBeInTheDocument();
    expect(screen.getByText('Profit Tartomány')).toBeInTheDocument();
    expect(screen.getByText('Tét Tartomány')).toBeInTheDocument();
    expect(screen.getByText('Státusz')).toBeInTheDocument();
    expect(screen.getByText('Rendezés')).toBeInTheDocument();
  });

  it('should handle date range selection', () => {
    render(
      <AnalyticsFilters 
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        onReset={mockOnReset}
      />
    );

    const startDate = screen.getByLabelText('Kezdő dátum');
    const endDate = screen.getByLabelText('Vég dátum');

    fireEvent.change(startDate, { target: { value: '2024-01-15' } });
    fireEvent.change(endDate, { target: { value: '2024-01-20' } });

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...mockFilters,
      dateRange: {
        start: new Date('2024-01-15'),
        end: new Date('2024-01-20')
      }
    });
  });

  it('should handle sport selection', () => {
    render(
      <AnalyticsFilters 
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        onReset={mockOnReset}
      />
    );

    const soccerCheckbox = screen.getByLabelText('Futball');
    const basketballCheckbox = screen.getByLabelText('Kosárlabda');
    const tennisCheckbox = screen.getByLabelText('Tenisz');

    fireEvent.click(tennisCheckbox);

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...mockFilters,
      sports: ['soccer', 'basketball', 'tennis']
    });

    fireEvent.click(soccerCheckbox);

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...mockFilters,
      sports: ['basketball', 'tennis']
    });
  });

  it('should handle bookmaker selection', () => {
    render(
      <AnalyticsFilters 
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        onReset={mockOnReset}
      />
    );

    const bet365Checkbox = screen.getByLabelText('Bet365');
    const williamHillCheckbox = screen.getByLabelText('William Hill');
    const unibetCheckbox = screen.getByLabelText('Unibet');

    fireEvent.click(unibetCheckbox);

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...mockFilters,
      bookmakers: ['Bet365', 'William Hill', 'Unibet']
    });

    fireEvent.click(bet365Checkbox);

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...mockFilters,
      bookmakers: ['William Hill', 'Unibet']
    });
  });

  it('should handle profit range selection', () => {
    render(
      <AnalyticsFilters 
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        onReset={mockOnReset}
      />
    );

    const minProfit = screen.getByLabelText('Minimum profit');
    const maxProfit = screen.getByLabelText('Maximum profit');

    fireEvent.change(minProfit, { target: { value: '200' } });
    fireEvent.change(maxProfit, { target: { value: '3000' } });

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...mockFilters,
      minProfit: 200,
      maxProfit: 3000
    });
  });

  it('should handle stake range selection', () => {
    render(
      <AnalyticsFilters 
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        onReset={mockOnReset}
      />
    );

    const minStake = screen.getByLabelText('Minimum tét');
    const maxStake = screen.getByLabelText('Maximum tét');

    fireEvent.change(minStake, { target: { value: '100' } });
    fireEvent.change(maxStake, { target: { value: '1500' } });

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...mockFilters,
      minStake: 100,
      maxStake: 1500
    });
  });

  it('should handle status selection', () => {
    render(
      <AnalyticsFilters 
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        onReset={mockOnReset}
      />
    );

    const wonCheckbox = screen.getByLabelText('Nyert');
    const lostCheckbox = screen.getByLabelText('Vesztett');
    const pendingCheckbox = screen.getByLabelText('Függőben');

    fireEvent.click(pendingCheckbox);

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...mockFilters,
      status: ['won', 'lost', 'pending']
    });

    fireEvent.click(wonCheckbox);

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...mockFilters,
      status: ['lost', 'pending']
    });
  });

  it('should handle sort selection', () => {
    render(
      <AnalyticsFilters 
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        onReset={mockOnReset}
      />
    );

    const sortBySelect = screen.getByDisplayValue('Dátum');
    const sortOrderSelect = screen.getByDisplayValue('Csökkenő');

    fireEvent.change(sortBySelect, { target: { value: 'profit' } });
    fireEvent.change(sortOrderSelect, { target: { value: 'asc' } });

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...mockFilters,
      sortBy: 'profit',
      sortOrder: 'asc'
    });
  });

  it('should handle reset button click', () => {
    render(
      <AnalyticsFilters 
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        onReset={mockOnReset}
      />
    );

    const resetButton = screen.getByText('Szűrők Törlése');
    fireEvent.click(resetButton);

    expect(mockOnReset).toHaveBeenCalledTimes(1);
  });

  it('should handle quick filter presets', () => {
    render(
      <AnalyticsFilters 
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        onReset={mockOnReset}
      />
    );

    const last7DaysButton = screen.getByText('Utolsó 7 nap');
    fireEvent.click(last7DaysButton);

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...mockFilters,
      dateRange: {
        start: expect.any(Date),
        end: expect.any(Date)
      }
    });
  });

  it('should validate profit range', () => {
    render(
      <AnalyticsFilters 
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        onReset={mockOnReset}
      />
    );

    const minProfit = screen.getByLabelText('Minimum profit');
    const maxProfit = screen.getByLabelText('Maximum profit');

    // Set invalid range (min > max)
    fireEvent.change(minProfit, { target: { value: '1000' } });
    fireEvent.change(maxProfit, { target: { value: '500' } });

    expect(screen.getByText('A minimum profit nem lehet nagyobb a maximum profitnál')).toBeInTheDocument();
  });

  it('should validate stake range', () => {
    render(
      <AnalyticsFilters 
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        onReset={mockOnReset}
      />
    );

    const minStake = screen.getByLabelText('Minimum tét');
    const maxStake = screen.getByLabelText('Maximum tét');

    // Set invalid range (min > max)
    fireEvent.change(minStake, { target: { value: '1000' } });
    fireEvent.change(maxStake, { target: { value: '500' } });

    expect(screen.getByText('A minimum tét nem lehet nagyobb a maximum tétnél')).toBeInTheDocument();
  });

  it('should handle date range validation', () => {
    render(
      <AnalyticsFilters 
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        onReset={mockOnReset}
      />
    );

    const startDate = screen.getByLabelText('Kezdő dátum');
    const endDate = screen.getByLabelText('Vég dátum');

    // Set invalid date range (end before start)
    fireEvent.change(startDate, { target: { value: '2024-01-15' } });
    fireEvent.change(endDate, { target: { value: '2024-01-10' } });

    expect(screen.getByText('A vég dátum nem lehet korábbi a kezdő dátumnál')).toBeInTheDocument();
  });

  it('should display active filter count', () => {
    render(
      <AnalyticsFilters 
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        onReset={mockOnReset}
      />
    );

    expect(screen.getByText('Aktív szűrők: 8')).toBeInTheDocument();
  });

  it('should handle filter collapse/expand', () => {
    render(
      <AnalyticsFilters 
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        onReset={mockOnReset}
      />
    );

    const collapseButton = screen.getByText('Szűrők Összecsukása');
    fireEvent.click(collapseButton);

    expect(screen.getByText('Szűrők Kinyitása')).toBeInTheDocument();
  });

  it('should handle clear individual filters', () => {
    render(
      <AnalyticsFilters 
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        onReset={mockOnReset}
      />
    );

    const clearSportsButton = screen.getByText('Sportok törlése');
    fireEvent.click(clearSportsButton);

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...mockFilters,
      sports: []
    });
  });

  it('should be responsive on different screen sizes', () => {
    render(
      <AnalyticsFilters 
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        onReset={mockOnReset}
        className="w-full md:w-1/2 lg:w-1/3"
      />
    );

    const filtersPanel = screen.getByTestId('analytics-filters');
    expect(filtersPanel).toHaveClass('w-full', 'md:w-1/2', 'lg:w-1/3');
  });

  it('should have proper accessibility attributes', () => {
    render(
      <AnalyticsFilters 
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        onReset={mockOnReset}
      />
    );

    const filtersPanel = screen.getByTestId('analytics-filters');
    expect(filtersPanel).toHaveAttribute('role', 'region');
    expect(filtersPanel).toHaveAttribute('aria-label', 'Analytics Filters');

    const resetButton = screen.getByText('Szűrők Törlése');
    expect(resetButton).toHaveAttribute('aria-label', 'Clear all filters');
  });

  it('should handle keyboard navigation', () => {
    render(
      <AnalyticsFilters 
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        onReset={mockOnReset}
      />
    );

    const resetButton = screen.getByText('Szűrők Törlése');
    resetButton.focus();

    fireEvent.keyDown(resetButton, { key: 'Enter' });
    expect(mockOnReset).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(resetButton, { key: ' ' });
    expect(mockOnReset).toHaveBeenCalledTimes(2);
  });

  it('should handle filter persistence', () => {
    render(
      <AnalyticsFilters 
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        onReset={mockOnReset}
      />
    );

    const minProfit = screen.getByLabelText('Minimum profit');
    fireEvent.change(minProfit, { target: { value: '200' } });

    // Simulate component remount
    const { rerender } = render(
      <AnalyticsFilters 
        filters={{ ...mockFilters, minProfit: 200 }}
        onFiltersChange={mockOnFiltersChange}
        onReset={mockOnReset}
      />
    );

    expect(minProfit).toHaveValue(200);
  });

  it('should handle empty filters', () => {
    const emptyFilters: AnalyticsFiltersType = {
      dateRange: {
        start: new Date(),
        end: new Date()
      },
      sports: [],
      bookmakers: [],
      minProfit: 0,
      maxProfit: 0,
      minStake: 0,
      maxStake: 0,
      status: [],
      sortBy: 'date',
      sortOrder: 'desc'
    };

    render(
      <AnalyticsFilters 
        filters={emptyFilters}
        onFiltersChange={mockOnFiltersChange}
        onReset={mockOnReset}
      />
    );

    expect(screen.getByText('Aktív szűrők: 0')).toBeInTheDocument();
  });

  it('should handle filter search', () => {
    render(
      <AnalyticsFilters 
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        onReset={mockOnReset}
      />
    );

    const searchInput = screen.getByPlaceholderText('Szűrők keresése...');
    fireEvent.change(searchInput, { target: { value: 'profit' } });

    expect(screen.getByText('Profit Tartomány')).toBeInTheDocument();
    expect(screen.queryByText('Sportok')).not.toBeInTheDocument();
  });
});