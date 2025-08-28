import type { Meta, StoryObj } from '@storybook/react';
import { ArbitrageTable } from '../components/ArbitrageTable';
import { ArbitrageOpportunity, mockArbitrageOpportunities } from '../lib/mock-data';

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
    opportunities: {
      control: 'object',
      description: 'Array of arbitrage opportunities'
    },
    oddsUpdateTrigger: {
      control: 'number',
      description: 'Trigger for simulating live odds updates'
    }
  },
} satisfies Meta<typeof ArbitrageTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    opportunities: mockArbitrageOpportunities,
  },
};

export const WithLiveUpdates: Story = {
  args: {
    opportunities: mockArbitrageOpportunities,
    oddsUpdateTrigger: 1,
  },
};

export const EmptyState: Story = {
  args: {
    opportunities: [],
  },
};

export const FewOpportunities: Story = {
  args: {
    opportunities: mockArbitrageOpportunities.slice(0, 3),
  },
};
