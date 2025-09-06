/**
 * Analytics TypeScript típusok
 * Sprint 9-10: Analytics Dashboard
 */

export interface DateRange {
  from: Date;
  to: Date;
}

export interface AnalyticsFilters {
  dateRange?: DateRange;
  sport?: string;
  bookmaker?: string;
  result?: 'won' | 'lost' | 'pending' | 'all';
}

export interface AnalyticsSummary {
  totalBets: number;
  wonBets: number;
  lostBets: number;
  pendingBets: number;
  totalStake: number;
  totalPayout: number;
  totalProfit: number;
  winRate: number;
  avgProfitPerBet: number;
  maxProfit: number;
  maxLoss: number;
}

export interface PerformanceMetrics {
  totalBets: number;
  winRate: number;
  totalProfit: number;
  avgProfitPerBet: number;
  maxProfit: number;
  maxLoss: number;
  roi: number; // Return on Investment
  profitMargin: number; // Profit margin percentage
}

export interface ProfitLossData {
  date: string;
  profit: number;
  stake: number;
  payout: number;
  betCount: number;
}

export interface BettingTrend {
  period: string;
  totalBets: number;
  winRate: number;
  profit: number;
  avgStake: number;
  trend: 'up' | 'down' | 'stable';
}

export interface SportPerformance {
  sport: string;
  totalBets: number;
  winRate: number;
  profit: number;
  avgStake: number;
  bestOdds: number;
  worstOdds: number;
}

export interface BookmakerPerformance {
  bookmaker: string;
  totalBets: number;
  winRate: number;
  profit: number;
  avgStake: number;
  avgOdds: number;
}

export interface AnalyticsChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
  }[];
}

export interface ExportOptions {
  format: 'pdf' | 'csv';
  dateRange: DateRange;
  filters: AnalyticsFilters;
  includeCharts: boolean;
  includeDetails: boolean;
}

export interface AnalyticsState {
  summary: AnalyticsSummary | null;
  performanceMetrics: PerformanceMetrics | null;
  profitLossData: ProfitLossData[];
  bettingTrends: BettingTrend[];
  sportPerformance: SportPerformance[];
  bookmakerPerformance: BookmakerPerformance[];
  isLoading: boolean;
  error: string | null;
  filters: AnalyticsFilters;
  dateRange: DateRange;
}

export interface AnalyticsContextType {
  state: AnalyticsState;
  actions: {
    setFilters: (filters: AnalyticsFilters) => void;
    setDateRange: (dateRange: DateRange) => void;
    refreshData: () => Promise<void>;
    exportData: (options: ExportOptions) => Promise<void>;
  };
}

// API Response típusok
export interface AnalyticsSummaryResponse {
  summary: AnalyticsSummary;
  period: string;
  dateRange: DateRange;
}

export interface BettingTrendsResponse {
  trends: BettingTrend[];
  period: string;
  dateRange: DateRange;
}

export interface PerformanceMetricsResponse {
  metrics: PerformanceMetrics;
  sportBreakdown: SportPerformance[];
  bookmakerBreakdown: BookmakerPerformance[];
}

export interface ExportRequest {
  format: 'pdf' | 'csv';
  dateRange: DateRange;
  filters: AnalyticsFilters;
  includeCharts: boolean;
  includeDetails: boolean;
}

export interface ExportResponse {
  success: boolean;
  downloadUrl?: string;
  error?: string;
}

// Chart konfiguráció típusok
export interface ChartConfig {
  responsive: boolean;
  maintainAspectRatio: boolean;
  plugins: {
    legend: {
      position: 'top' | 'bottom' | 'left' | 'right';
    };
    tooltip: {
      enabled: boolean;
    };
  };
  scales?: {
    x?: {
      display: boolean;
      title: {
        display: boolean;
        text: string;
      };
    };
    y?: {
      display: boolean;
      title: {
        display: boolean;
        text: string;
      };
    };
  };
}

// Utility típusok
export type AnalyticsPeriod = 'day' | 'week' | 'month' | 'year' | 'all';
export type ChartType = 'line' | 'bar' | 'pie' | 'doughnut';
export type SortOrder = 'asc' | 'desc';
export type SortField = 'date' | 'profit' | 'stake' | 'winRate';

// Filter típusok
export interface DateFilter {
  type: 'custom' | 'preset';
  preset?: 'today' | 'yesterday' | 'last7days' | 'last30days' | 'last90days' | 'thisMonth' | 'lastMonth' | 'thisYear';
  custom?: DateRange;
}

export interface SportFilter {
  type: 'all' | 'selected';
  sports: string[];
}

export interface BookmakerFilter {
  type: 'all' | 'selected';
  bookmakers: string[];
}

export interface ResultFilter {
  type: 'all' | 'selected';
  results: ('won' | 'lost' | 'pending')[];
}

// Dashboard widget típusok
export interface DashboardWidget {
  id: string;
  title: string;
  type: 'metric' | 'chart' | 'table' | 'list';
  size: 'small' | 'medium' | 'large' | 'full';
  position: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  config: Record<string, any>;
  data?: any;
}

export interface DashboardLayout {
  widgets: DashboardWidget[];
  columns: number;
  gap: number;
  padding: number;
}

// Real-time update típusok
export interface AnalyticsUpdate {
  type: 'bet_added' | 'bet_updated' | 'bet_removed' | 'bet_result_updated';
  betId: string;
  userId: string;
  timestamp: Date;
  data: any;
}

export interface RealtimeSubscription {
  channel: string;
  event: string;
  callback: (payload: AnalyticsUpdate) => void;
  unsubscribe: () => void;
}
