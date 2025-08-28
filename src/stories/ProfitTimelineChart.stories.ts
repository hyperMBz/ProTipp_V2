import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ProfitTimelineChart } from '../components/analytics/ProfitTimelineChart';

// Mock data for the chart
const mockProfitData = [
  { date: '2024-01-01', profit: 0, cumulativeProfit: 0 },
  { date: '2024-01-02', profit: 25.50, cumulativeProfit: 25.50 },
  { date: '2024-01-03', profit: -15.20, cumulativeProfit: 10.30 },
  { date: '2024-01-04', profit: 45.80, cumulativeProfit: 56.10 },
  { date: '2024-01-05', profit: 12.30, cumulativeProfit: 68.40 },
  { date: '2024-01-06', profit: -8.90, cumulativeProfit: 59.50 },
  { date: '2024-01-07', profit: 33.70, cumulativeProfit: 93.20 },
];

const meta = {
  title: 'Analytics/ProfitTimelineChart',
  component: ProfitTimelineChart,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Real-time profit timeline chart showing cumulative profit over time for sports betting analysis.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    data: { 
      control: 'object',
      description: 'Array of profit data points with date, profit, and cumulativeProfit'
    },
    height: {
      control: 'number',
      defaultValue: 300
    }
  },
} satisfies Meta<typeof ProfitTimelineChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    data: mockProfitData,
    height: 300,
  },
};

export const ProfitableWeek: Story = {
  args: {
    data: [
      { date: '2024-01-01', profit: 0, cumulativeProfit: 0 },
      { date: '2024-01-02', profit: 45.20, cumulativeProfit: 45.20 },
      { date: '2024-01-03', profit: 32.80, cumulativeProfit: 78.00 },
      { date: '2024-01-04', profit: 28.50, cumulativeProfit: 106.50 },
      { date: '2024-01-05', profit: 55.30, cumulativeProfit: 161.80 },
      { date: '2024-01-06', profit: 22.40, cumulativeProfit: 184.20 },
      { date: '2024-01-07', profit: 38.90, cumulativeProfit: 223.10 },
    ],
    height: 300,
  },
};

export const VolatileWeek: Story = {
  args: {
    data: [
      { date: '2024-01-01', profit: 0, cumulativeProfit: 0 },
      { date: '2024-01-02', profit: 85.20, cumulativeProfit: 85.20 },
      { date: '2024-01-03', profit: -45.80, cumulativeProfit: 39.40 },
      { date: '2024-01-04', profit: -25.50, cumulativeProfit: 13.90 },
      { date: '2024-01-05', profit: 125.30, cumulativeProfit: 139.20 },
      { date: '2024-01-06', profit: -65.40, cumulativeProfit: 73.80 },
      { date: '2024-01-07', profit: 48.90, cumulativeProfit: 122.70 },
    ],
    height: 300,
  },
};

export const LargeChart: Story = {
  args: {
    data: mockProfitData,
    height: 500,
  },
};
