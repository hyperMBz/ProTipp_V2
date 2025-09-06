/**
 * BetTrackerItem Unit Tests
 * Sprint 11 - Tesztelési Hiányosságok Javítása
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BetTrackerItem } from '../BetTrackerItem';
import { BetTrackerItem as BetTrackerItemType } from '@/lib/types/bet-tracker';
import { useBetTrackerActions } from '../BetTrackerProvider';

// Mock the useBetTrackerActions hook
jest.mock('../BetTrackerProvider');
const mockUseBetTrackerActions = useBetTrackerActions as jest.MockedFunction<typeof useBetTrackerActions>;

// Mock data
const mockBet: BetTrackerItemType = {
  id: '1',
  event_name: 'Manchester United vs Liverpool',
  sport: 'soccer',
  bookmaker: 'Bet365',
  odds: 2.5,
  stake: 100,
  potential_payout: 250,
  profit: 150,
  status: 'pending',
  notes: 'Test bet',
  created_at: new Date('2024-01-01'),
  updated_at: new Date('2024-01-01')
};

const mockOnRemove = jest.fn();
const mockOnUpdate = jest.fn();
const mockUpdateBet = jest.fn();

describe('BetTrackerItem', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseBetTrackerActions.mockReturnValue({
      updateBet: mockUpdateBet,
      removeFromTracker: jest.fn(),
      clearTracker: jest.fn()
    });
  });

  it('should render bet tracker item with correct data', () => {
    render(
      <BetTrackerItem 
        bet={mockBet}
        onRemove={mockOnRemove}
        onUpdate={mockOnUpdate}
      />
    );

    expect(screen.getByText('Manchester United vs Liverpool')).toBeInTheDocument();
    expect(screen.getByText('soccer')).toBeInTheDocument();
    expect(screen.getByText('Bet365')).toBeInTheDocument();
    expect(screen.getByText('2.5')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('250')).toBeInTheDocument();
    expect(screen.getByText('150')).toBeInTheDocument();
    expect(screen.getByText('Függőben')).toBeInTheDocument();
    expect(screen.getByText('Test bet')).toBeInTheDocument();
  });

  it('should display correct status badge for pending bet', () => {
    render(
      <BetTrackerItem 
        bet={mockBet}
        onRemove={mockOnRemove}
        onUpdate={mockOnUpdate}
      />
    );

    const statusBadge = screen.getByText('Függőben');
    expect(statusBadge).toHaveClass('bg-yellow-500/20', 'text-yellow-400', 'border-yellow-500/30');
  });

  it('should display correct status badge for won bet', () => {
    const wonBet = { ...mockBet, status: 'won' as const };
    
    render(
      <BetTrackerItem 
        bet={wonBet}
        onRemove={mockOnRemove}
        onUpdate={mockOnUpdate}
      />
    );

    const statusBadge = screen.getByText('Nyert');
    expect(statusBadge).toHaveClass('bg-green-500/20', 'text-green-400', 'border-green-500/30');
  });

  it('should display correct status badge for lost bet', () => {
    const lostBet = { ...mockBet, status: 'lost' as const };
    
    render(
      <BetTrackerItem 
        bet={lostBet}
        onRemove={mockOnRemove}
        onUpdate={mockOnUpdate}
      />
    );

    const statusBadge = screen.getByText('Vesztett');
    expect(statusBadge).toHaveClass('bg-red-500/20', 'text-red-400', 'border-red-500/30');
  });

  it('should display correct status badge for cancelled bet', () => {
    const cancelledBet = { ...mockBet, status: 'cancelled' as const };
    
    render(
      <BetTrackerItem 
        bet={cancelledBet}
        onRemove={mockOnRemove}
        onUpdate={mockOnUpdate}
      />
    );

    const statusBadge = screen.getByText('Törölve');
    expect(statusBadge).toHaveClass('bg-gray-500/20', 'text-gray-400', 'border-gray-500/30');
  });

  it('should display correct profit color for positive profit', () => {
    render(
      <BetTrackerItem 
        bet={mockBet}
        onRemove={mockOnRemove}
        onUpdate={mockOnUpdate}
      />
    );

    const profitElement = screen.getByText('150');
    expect(profitElement).toHaveClass('text-green-400');
  });

  it('should display correct profit color for negative profit', () => {
    const negativeProfitBet = { ...mockBet, profit: -50 };
    
    render(
      <BetTrackerItem 
        bet={negativeProfitBet}
        onRemove={mockOnRemove}
        onUpdate={mockOnUpdate}
      />
    );

    const profitElement = screen.getByText('-50');
    expect(profitElement).toHaveClass('text-red-400');
  });

  it('should display correct profit color for zero profit', () => {
    const zeroProfitBet = { ...mockBet, profit: 0 };
    
    render(
      <BetTrackerItem 
        bet={zeroProfitBet}
        onRemove={mockOnRemove}
        onUpdate={mockOnUpdate}
      />
    );

    const profitElement = screen.getByText('0');
    expect(profitElement).toHaveClass('text-muted-foreground');
  });

  it('should handle edit mode activation', () => {
    render(
      <BetTrackerItem 
        bet={mockBet}
        onRemove={mockOnRemove}
        onUpdate={mockOnUpdate}
      />
    );

    const editButton = screen.getByText('Szerkesztés');
    fireEvent.click(editButton);

    expect(screen.getByDisplayValue('100')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test bet')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Függőben')).toBeInTheDocument();
  });

  it('should handle stake update', async () => {
    render(
      <BetTrackerItem 
        bet={mockBet}
        onRemove={mockOnRemove}
        onUpdate={mockOnUpdate}
      />
    );

    const editButton = screen.getByText('Szerkesztés');
    fireEvent.click(editButton);

    const stakeInput = screen.getByDisplayValue('100');
    fireEvent.change(stakeInput, { target: { value: '150' } });

    const saveButton = screen.getByText('Mentés');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockUpdateBet).toHaveBeenCalledWith('1', {
        stake: 150,
        notes: 'Test bet',
        status: 'pending'
      });
    });
  });

  it('should handle notes update', async () => {
    render(
      <BetTrackerItem 
        bet={mockBet}
        onRemove={mockOnRemove}
        onUpdate={mockOnUpdate}
      />
    );

    const editButton = screen.getByText('Szerkesztés');
    fireEvent.click(editButton);

    const notesInput = screen.getByDisplayValue('Test bet');
    fireEvent.change(notesInput, { target: { value: 'Updated notes' } });

    const saveButton = screen.getByText('Mentés');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockUpdateBet).toHaveBeenCalledWith('1', {
        stake: 100,
        notes: 'Updated notes',
        status: 'pending'
      });
    });
  });

  it('should handle status update', async () => {
    render(
      <BetTrackerItem 
        bet={mockBet}
        onRemove={mockOnRemove}
        onUpdate={mockOnUpdate}
      />
    );

    const editButton = screen.getByText('Szerkesztés');
    fireEvent.click(editButton);

    const statusSelect = screen.getByDisplayValue('Függőben');
    fireEvent.change(statusSelect, { target: { value: 'won' } });

    const saveButton = screen.getByText('Mentés');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockUpdateBet).toHaveBeenCalledWith('1', {
        stake: 100,
        notes: 'Test bet',
        status: 'won'
      });
    });
  });

  it('should handle edit cancellation', () => {
    render(
      <BetTrackerItem 
        bet={mockBet}
        onRemove={mockOnRemove}
        onUpdate={mockOnUpdate}
      />
    );

    const editButton = screen.getByText('Szerkesztés');
    fireEvent.click(editButton);

    const stakeInput = screen.getByDisplayValue('100');
    fireEvent.change(stakeInput, { target: { value: '200' } });

    const cancelButton = screen.getByText('Mégse');
    fireEvent.click(cancelButton);

    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.queryByDisplayValue('200')).not.toBeInTheDocument();
  });

  it('should handle bet removal', async () => {
    render(
      <BetTrackerItem 
        bet={mockBet}
        onRemove={mockOnRemove}
        onUpdate={mockOnUpdate}
      />
    );

    const removeButton = screen.getByText('Törlés');
    fireEvent.click(removeButton);

    await waitFor(() => {
      expect(mockOnRemove).toHaveBeenCalledWith('1');
    });
  });

  it('should handle update error', async () => {
    mockUpdateBet.mockRejectedValue(new Error('Update failed'));

    render(
      <BetTrackerItem 
        bet={mockBet}
        onRemove={mockOnRemove}
        onUpdate={mockOnUpdate}
      />
    );

    const editButton = screen.getByText('Szerkesztés');
    fireEvent.click(editButton);

    const saveButton = screen.getByText('Mentés');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Hiba történt a frissítés során')).toBeInTheDocument();
    });
  });

  it('should show loading state during update', async () => {
    mockUpdateBet.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));

    render(
      <BetTrackerItem 
        bet={mockBet}
        onRemove={mockOnRemove}
        onUpdate={mockOnUpdate}
      />
    );

    const editButton = screen.getByText('Szerkesztés');
    fireEvent.click(editButton);

    const saveButton = screen.getByText('Mentés');
    fireEvent.click(saveButton);

    expect(screen.getByText('Frissítés...')).toBeInTheDocument();
  });

  it('should handle bet with no notes', () => {
    const betWithoutNotes = { ...mockBet, notes: '' };
    
    render(
      <BetTrackerItem 
        bet={betWithoutNotes}
        onRemove={mockOnRemove}
        onUpdate={mockOnUpdate}
      />
    );

    expect(screen.getByText('Nincs megjegyzés')).toBeInTheDocument();
  });

  it('should handle bet with no stake', () => {
    const betWithoutStake = { ...mockBet, stake: 0 };
    
    render(
      <BetTrackerItem 
        bet={betWithoutStake}
        onRemove={mockOnRemove}
        onUpdate={mockOnUpdate}
      />
    );

    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('should format date correctly', () => {
    render(
      <BetTrackerItem 
        bet={mockBet}
        onRemove={mockOnRemove}
        onUpdate={mockOnUpdate}
      />
    );

    expect(screen.getByText('2024.01.01')).toBeInTheDocument();
  });

  it('should handle bet with very long event name', () => {
    const longEventNameBet = { 
      ...mockBet, 
      event_name: 'Very Long Event Name That Should Be Truncated Because It Is Too Long To Display Properly'
    };
    
    render(
      <BetTrackerItem 
        bet={longEventNameBet}
        onRemove={mockOnRemove}
        onUpdate={mockOnUpdate}
      />
    );

    expect(screen.getByText('Very Long Event Name That Should Be Truncated Because It Is Too Long To Display Properly')).toBeInTheDocument();
  });

  it('should handle bet with very long notes', () => {
    const longNotesBet = { 
      ...mockBet, 
      notes: 'Very long notes that should be truncated because they are too long to display properly in the UI'
    };
    
    render(
      <BetTrackerItem 
        bet={longNotesBet}
        onRemove={mockOnRemove}
        onUpdate={mockOnUpdate}
      />
    );

    expect(screen.getByText('Very long notes that should be truncated because they are too long to display properly in the UI')).toBeInTheDocument();
  });

  it('should be responsive on different screen sizes', () => {
    render(
      <BetTrackerItem 
        bet={mockBet}
        onRemove={mockOnRemove}
        onUpdate={mockOnUpdate}
        className="w-full md:w-1/2 lg:w-1/3"
      />
    );

    const item = screen.getByTestId('bet-tracker-item');
    expect(item).toHaveClass('w-full', 'md:w-1/2', 'lg:w-1/3');
  });

  it('should have proper accessibility attributes', () => {
    render(
      <BetTrackerItem 
        bet={mockBet}
        onRemove={mockOnRemove}
        onUpdate={mockOnUpdate}
      />
    );

    const item = screen.getByTestId('bet-tracker-item');
    expect(item).toHaveAttribute('role', 'article');
    expect(item).toHaveAttribute('aria-label', 'Bet Tracker Item');

    const editButton = screen.getByText('Szerkesztés');
    expect(editButton).toHaveAttribute('aria-label', 'Edit bet');

    const removeButton = screen.getByText('Törlés');
    expect(removeButton).toHaveAttribute('aria-label', 'Remove bet');
  });

  it('should handle keyboard navigation', () => {
    render(
      <BetTrackerItem 
        bet={mockBet}
        onRemove={mockOnRemove}
        onUpdate={mockOnUpdate}
      />
    );

    const editButton = screen.getByText('Szerkesztés');
    editButton.focus();

    fireEvent.keyDown(editButton, { key: 'Enter' });
    expect(screen.getByDisplayValue('100')).toBeInTheDocument();

    fireEvent.keyDown(editButton, { key: ' ' });
    expect(screen.getByDisplayValue('100')).toBeInTheDocument();
  });

  it('should handle bet with missing optional fields', () => {
    const incompleteBet = {
      id: '1',
      event_name: 'Test Event',
      sport: 'soccer',
      bookmaker: 'Test Bookmaker',
      odds: 2.0,
      stake: 100,
      potential_payout: 200,
      profit: 100,
      status: 'pending' as const,
      notes: '',
      created_at: new Date('2024-01-01'),
      updated_at: new Date('2024-01-01')
    };
    
    render(
      <BetTrackerItem 
        bet={incompleteBet}
        onRemove={mockOnRemove}
        onUpdate={mockOnUpdate}
      />
    );

    expect(screen.getByText('Test Event')).toBeInTheDocument();
    expect(screen.getByText('Nincs megjegyzés')).toBeInTheDocument();
  });

  it('should handle bet with zero odds', () => {
    const zeroOddsBet = { ...mockBet, odds: 0 };
    
    render(
      <BetTrackerItem 
        bet={zeroOddsBet}
        onRemove={mockOnRemove}
        onUpdate={mockOnUpdate}
      />
    );

    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('should handle bet with very high odds', () => {
    const highOddsBet = { ...mockBet, odds: 999.99 };
    
    render(
      <BetTrackerItem 
        bet={highOddsBet}
        onRemove={mockOnRemove}
        onUpdate={mockOnUpdate}
      />
    );

    expect(screen.getByText('999.99')).toBeInTheDocument();
  });
});