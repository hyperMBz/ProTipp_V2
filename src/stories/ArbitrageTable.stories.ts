import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ArbitrageTable } from '../components/ArbitrageTable';

// Mock arbitrage opportunities
const mockArbitrageData = [
  {
    id: '1',
    sport: 'Football',
    event: 'Manchester United vs Arsenal',
    bookmaker1: 'Bet365',
    odds1: 2.10,
    bookmaker2: 'William Hill', 
    odds2: 2.05,
    profit: 2.38,
    stake: 100,
    eventTime: '2024-01-15 15:00:00'
  },
  {
    id: '2', 
    sport: 'Basketball',
    event: 'Lakers vs Warriors',
    bookmaker1: 'Pinnacle',
    odds1: 1.95,
    bookmaker2: 'Betfair',
    odds2: 2.15,
    profit: 5.12,
    stake: 200,
    eventTime: '2024-01-15 20:30:00'
  },
  {
    id: '3',
    sport: 'Tennis', 
    event: 'Djokovic vs Nadal',
    bookmaker1: 'Unibet',
    odds1: 1.85,
    bookmaker2: '1xBet',
    odds2: 2.25,
    profit: 8.65,
    stake: 150,
    eventTime: '2024-01-16 14:00:00'
  }
];

const meta = {
  title: 'Betting/ArbitrageTable',
  component: ArbitrageTable,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Table displaying profitable arbitrage betting opportunities with real-time odds comparison.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    data: { 
      control: 'object',
      description: 'Array of arbitrage opportunities'
    },
    loading: {
      control: 'boolean',
      defaultValue: false
    }
  },
} satisfies Meta<typeof ArbitrageTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // data: mockArbitrageData,
    loading: false,
  },
};

export const Loading: Story = {
  args: {
    // data: [],
    loading: true,
  },
};

export const HighProfitOpportunities: Story = {
  args: {
    // data: mockArbitrageData.map(item => ({
    //   ...item,
    //   profit: item.profit * 2
    // })),
    loading: false,
  },
};

export const EmptyState: Story = {
  args: {
    // data: [],
    loading: false,
  },
};
