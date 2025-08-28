import type { Meta, StoryObj } from '@storybook/react';
import { ProfitTimelineChart } from '../components/analytics/ProfitTimelineChart';
import { UnifiedBetHistory } from '../lib/types/bet-history'; // Importáljuk a helyes típust

// Mock adatok, amik megfelelnek a UnifiedBetHistory típusnak
const mockBetHistory: UnifiedBetHistory[] = [
  { id: '1', sport: 'Soccer', bookmaker: 'Bet365', odds: 2.1, stake: 100, outcome: 'won', status: 'won', placed_at: '2024-01-01T12:00:00Z', profit: 110 },
  { id: '2', sport: 'Tennis', bookmaker: 'Pinnacle', odds: 1.8, stake: 50, outcome: 'lost', status: 'lost', placed_at: '2024-01-02T15:30:00Z', profit: -50 },
  { id: '3', sport: 'Basketball', bookmaker: 'Unibet', odds: 1.9, stake: 75, outcome: 'won', status: 'won', placed_at: '2024-01-03T20:00:00Z', profit: 67.5 },
  { id: '4', sport: 'Soccer', bookmaker: 'Bet365', odds: 3.5, stake: 25, outcome: 'won', status: 'won', placed_at: '2024-01-04T18:45:00Z', profit: 62.5 },
  { id: '5', sport: 'Tennis', bookmaker: 'Pinnacle', odds: 2.5, stake: 120, outcome: 'lost', status: 'lost', placed_at: '2024-01-05T11:00:00Z', profit: -120 },
];

const meta = {
  title: 'Analytics/ProfitTimelineChart',
  component: ProfitTimelineChart,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Real-time profit timeline chart showing cumulative profit over time. This component expects a full UnifiedBetHistory[] array and processes it internally.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    data: { 
      control: 'object',
      description: 'Array of full UnifiedBetHistory data points.'
    },
    height: {
      control: 'number',
      defaultValue: 300
    }
  },
} satisfies Meta<typeof ProfitTimelineChart>;

export default meta;
type Story = StoryObj<typeof meta>;

// Most már a `data` prop a teljes bet history tömböt várja
export const Default: Story = {
  args: {
    data: mockBetHistory,
    height: 300,
  },
};

export const ProfitableWeek: Story = {
  args: {
    data: [
      ...mockBetHistory,
      { id: '6', sport: 'Soccer', bookmaker: 'Bet365', odds: 2.0, stake: 200, outcome: 'won', status: 'won', placed_at: '2024-01-06T14:00:00Z', profit: 200 },
      { id: '7', sport: 'Basketball', bookmaker: 'Unibet', odds: 1.5, stake: 150, outcome: 'won', status: 'won', placed_at: '2024-01-07T21:00:00Z', profit: 75 },
    ],
    height: 300,
  },
};

export const LargeChart: Story = {
  args: {
    data: mockBetHistory,
    height: 500,
  },
};
