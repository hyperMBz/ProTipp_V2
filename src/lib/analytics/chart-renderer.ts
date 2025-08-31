import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';
import { ProfitLossData, ROITrendData, WinRateData, SportPerformanceData, BookmakerPerformanceData } from './data-processor';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement
);

export interface ChartConfig {
  responsive?: boolean;
  maintainAspectRatio?: boolean;
  plugins?: {
    legend?: {
      display?: boolean;
      position?: 'top' | 'bottom' | 'left' | 'right';
    };
    title?: {
      display?: boolean;
      text?: string;
    };
    tooltip?: {
      enabled?: boolean;
      mode?: 'index' | 'dataset' | 'point' | 'nearest' | 'x' | 'y';
    };
  };
  scales?: {
    x?: {
      display?: boolean;
      grid?: {
        display?: boolean;
      };
    };
    y?: {
      display?: boolean;
      grid?: {
        display?: boolean;
      };
    };
  };
}

export class ChartRenderer {
  private static readonly defaultColors = [
    'hsl(262, 83%, 58%)', // Primary purple
    'hsl(280, 65%, 45%)', // Deep purple
    'hsl(295, 70%, 35%)', // Violet
    'hsl(310, 60%, 40%)', // Magenta
    'hsl(325, 55%, 50%)', // Pink
    'hsl(142, 76%, 36%)', // Green
    'hsl(48, 96%, 53%)',  // Yellow
    'hsl(0, 84%, 60%)',   // Red
  ];

  /**
   * Create profit/loss line chart
   */
  static createProfitLossChart(
    data: ProfitLossData[],
    config: ChartConfig = {}
  ) {
    const chartData = {
      labels: data.map(item => item.date),
      datasets: [
        {
          label: 'Napi Profit',
          data: data.map(item => item.profit),
          borderColor: 'hsl(142, 76%, 36%)',
          backgroundColor: 'hsla(142, 76%, 36%, 0.1)',
          borderWidth: 2,
          fill: false,
          tension: 0.4,
        },
        {
          label: 'Kumulatív Profit',
          data: data.map(item => item.cumulative_profit),
          borderColor: 'hsl(262, 83%, 58%)',
          backgroundColor: 'hsla(262, 83%, 58%, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
        },
      ],
    };

    const chartOptions = {
      responsive: config.responsive ?? true,
      maintainAspectRatio: config.maintainAspectRatio ?? false,
      plugins: {
        legend: {
          display: config.plugins?.legend?.display ?? true,
          position: config.plugins?.legend?.position ?? 'top',
        },
        title: {
          display: config.plugins?.title?.display ?? true,
          text: config.plugins?.title?.text ?? 'Profit/Loss Trend',
          color: 'hsl(0, 0%, 98%)',
        },
        tooltip: {
          enabled: config.plugins?.tooltip?.enabled ?? true,
          mode: config.plugins?.tooltip?.mode ?? 'index',
          callbacks: {
            label: (context: { dataset: { label?: string }; parsed: { y: number } }) => {
              const label = context.dataset.label || '';
              const value = context.parsed.y;
              return `${label}: ${value >= 0 ? '+' : ''}${value.toLocaleString('hu-HU')} Ft`;
            },
          },
        },
      },
      scales: {
        x: {
          display: config.scales?.x?.display ?? true,
          grid: {
            display: config.scales?.x?.grid?.display ?? false,
            color: 'hsla(0, 0%, 98%, 0.1)',
          },
          ticks: {
            color: 'hsl(0, 0%, 98%)',
          },
        },
        y: {
          display: config.scales?.y?.display ?? true,
          grid: {
            display: config.scales?.y?.grid?.display ?? true,
            color: 'hsla(0, 0%, 98%, 0.1)',
          },
          ticks: {
            color: 'hsl(0, 0%, 98%)',
            callback: (value: number) => `${value >= 0 ? '+' : ''}${value.toLocaleString('hu-HU')} Ft`,
          },
        },
      },
      interaction: {
        intersect: false,
        mode: 'index',
      },
    };

    return { data: chartData, options: chartOptions };
  }

  /**
   * Create ROI trends bar chart
   */
  static createROITrendsChart(
    data: ROITrendData[],
    config: ChartConfig = {}
  ) {
    const chartData = {
      labels: data.map(item => item.period),
      datasets: [
        {
          label: 'ROI %',
          data: data.map(item => item.roi_percentage),
          backgroundColor: data.map(item => 
            item.roi_percentage >= 0 
              ? 'hsla(142, 76%, 36%, 0.8)' 
              : 'hsla(0, 84%, 60%, 0.8)'
          ),
          borderColor: data.map(item => 
            item.roi_percentage >= 0 
              ? 'hsl(142, 76%, 36%)' 
              : 'hsl(0, 84%, 60%)'
          ),
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    };

    const chartOptions = {
      responsive: config.responsive ?? true,
      maintainAspectRatio: config.maintainAspectRatio ?? false,
      plugins: {
        legend: {
          display: config.plugins?.legend?.display ?? false,
        },
        title: {
          display: config.plugins?.title?.display ?? true,
          text: config.plugins?.title?.text ?? 'ROI Trends',
          color: 'hsl(0, 0%, 98%)',
        },
        tooltip: {
          enabled: config.plugins?.tooltip?.enabled ?? true,
          callbacks: {
            label: (context: { parsed: { y: number } }) => {
              const value = context.parsed.y;
              return `ROI: ${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
            },
            afterLabel: (context: { dataIndex: number }) => {
              const index = context.dataIndex;
              const item = data[index];
              return [
                `Profit: ${item.total_profit >= 0 ? '+' : ''}${item.total_profit.toLocaleString('hu-HU')} Ft`,
                `Tét: ${item.total_staked.toLocaleString('hu-HU')} Ft`,
                `Fogadások: ${item.bet_count}`,
              ];
            },
          },
        },
      },
      scales: {
        x: {
          display: config.scales?.x?.display ?? true,
          grid: {
            display: config.scales?.x?.grid?.display ?? false,
            color: 'hsla(0, 0%, 98%, 0.1)',
          },
          ticks: {
            color: 'hsl(0, 0%, 98%)',
          },
        },
        y: {
          display: config.scales?.y?.display ?? true,
          grid: {
            display: config.scales?.y?.grid?.display ?? true,
            color: 'hsla(0, 0%, 98%, 0.1)',
          },
          ticks: {
            color: 'hsl(0, 0%, 98%)',
            callback: (value: number) => `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`,
          },
        },
      },
    };

    return { data: chartData, options: chartOptions };
  }

  /**
   * Create win rate analysis chart
   */
  static createWinRateChart(
    data: WinRateData[],
    config: ChartConfig = {}
  ) {
    const chartData = {
      labels: data.map(item => item.period),
      datasets: [
        {
          label: 'Win Rate %',
          data: data.map(item => item.win_rate),
          borderColor: 'hsl(262, 83%, 58%)',
          backgroundColor: 'hsla(262, 83%, 58%, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: 'hsl(262, 83%, 58%)',
          pointBorderColor: 'hsl(0, 0%, 98%)',
          pointBorderWidth: 2,
          pointRadius: 6,
        },
      ],
    };

    const chartOptions = {
      responsive: config.responsive ?? true,
      maintainAspectRatio: config.maintainAspectRatio ?? false,
      plugins: {
        legend: {
          display: config.plugins?.legend?.display ?? false,
        },
        title: {
          display: config.plugins?.title?.display ?? true,
          text: config.plugins?.title?.text ?? 'Win Rate Analysis',
          color: 'hsl(0, 0%, 98%)',
        },
        tooltip: {
          enabled: config.plugins?.tooltip?.enabled ?? true,
          callbacks: {
            label: (context: { parsed: { y: number } }) => {
              const value = context.parsed.y;
              return `Win Rate: ${value.toFixed(1)}%`;
            },
            afterLabel: (context: { dataIndex: number }) => {
              const index = context.dataIndex;
              const item = data[index];
              return [
                `Nyertes fogadások: ${item.winning_bets}`,
                `Vesztes fogadások: ${item.losing_bets}`,
                `Összes fogadás: ${item.total_bets}`,
              ];
            },
          },
        },
      },
      scales: {
        x: {
          display: config.scales?.x?.display ?? true,
          grid: {
            display: config.scales?.x?.grid?.display ?? false,
            color: 'hsla(0, 0%, 98%, 0.1)',
          },
          ticks: {
            color: 'hsl(0, 0%, 98%)',
          },
        },
        y: {
          display: config.scales?.y?.display ?? true,
          grid: {
            display: config.scales?.y?.grid?.display ?? true,
            color: 'hsla(0, 0%, 98%, 0.1)',
          },
          ticks: {
            color: 'hsl(0, 0%, 98%)',
            callback: (value: number) => `${value.toFixed(0)}%`,
          },
          min: 0,
          max: 100,
        },
      },
    };

    return { data: chartData, options: chartOptions };
  }

  /**
   * Create sport performance chart
   */
  static createSportPerformanceChart(
    data: SportPerformanceData[],
    config: ChartConfig = {}
  ) {
    const chartData = {
      labels: data.map(item => item.sport),
      datasets: [
        {
          label: 'Profit (Ft)',
          data: data.map(item => item.total_profit),
          backgroundColor: data.map(item => 
            item.total_profit >= 0 
              ? 'hsla(142, 76%, 36%, 0.8)' 
              : 'hsla(0, 84%, 60%, 0.8)'
          ),
          borderColor: data.map(item => 
            item.total_profit >= 0 
              ? 'hsl(142, 76%, 36%)' 
              : 'hsl(0, 84%, 60%)'
          ),
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    };

    const chartOptions = {
      responsive: config.responsive ?? true,
      maintainAspectRatio: config.maintainAspectRatio ?? false,
      plugins: {
        legend: {
          display: config.plugins?.legend?.display ?? false,
        },
        title: {
          display: config.plugins?.title?.display ?? true,
          text: config.plugins?.title?.text ?? 'Sport Performance',
          color: 'hsl(0, 0%, 98%)',
        },
        tooltip: {
          enabled: config.plugins?.tooltip?.enabled ?? true,
          callbacks: {
            label: (context: { parsed: { y: number } }) => {
              const value = context.parsed.y;
              return `Profit: ${value >= 0 ? '+' : ''}${value.toLocaleString('hu-HU')} Ft`;
            },
            afterLabel: (context: { dataIndex: number }) => {
              const index = context.dataIndex;
              const item = data[index];
              return [
                `ROI: ${item.roi_percentage >= 0 ? '+' : ''}${item.roi_percentage.toFixed(2)}%`,
                `Win Rate: ${item.win_rate.toFixed(1)}%`,
                `Fogadások: ${item.total_bets}`,
                `Átlagos odds: ${item.average_odds.toFixed(2)}`,
              ];
            },
          },
        },
      },
      scales: {
        x: {
          display: config.scales?.x?.display ?? true,
          grid: {
            display: config.scales?.x?.grid?.display ?? false,
            color: 'hsla(0, 0%, 98%, 0.1)',
          },
          ticks: {
            color: 'hsl(0, 0%, 98%)',
          },
        },
        y: {
          display: config.scales?.y?.display ?? true,
          grid: {
            display: config.scales?.y?.grid?.display ?? true,
            color: 'hsla(0, 0%, 98%, 0.1)',
          },
          ticks: {
            color: 'hsl(0, 0%, 98%)',
            callback: (value: number) => `${value >= 0 ? '+' : ''}${value.toLocaleString('hu-HU')} Ft`,
          },
        },
      },
    };

    return { data: chartData, options: chartOptions };
  }

  /**
   * Create bookmaker performance chart
   */
  static createBookmakerPerformanceChart(
    data: BookmakerPerformanceData[],
    config: ChartConfig = {}
  ) {
    const chartData = {
      labels: data.map(item => item.bookmaker),
      datasets: [
        {
          label: 'ROI %',
          data: data.map(item => item.roi_percentage),
          backgroundColor: data.map(item => 
            item.roi_percentage >= 0 
              ? 'hsla(142, 76%, 36%, 0.8)' 
              : 'hsla(0, 84%, 60%, 0.8)'
          ),
          borderColor: data.map(item => 
            item.roi_percentage >= 0 
              ? 'hsl(142, 76%, 36%)' 
              : 'hsl(0, 84%, 60%)'
          ),
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    };

    const chartOptions = {
      responsive: config.responsive ?? true,
      maintainAspectRatio: config.maintainAspectRatio ?? false,
      plugins: {
        legend: {
          display: config.plugins?.legend?.display ?? false,
        },
        title: {
          display: config.plugins?.title?.display ?? true,
          text: config.plugins?.title?.text ?? 'Bookmaker Performance',
          color: 'hsl(0, 0%, 98%)',
        },
        tooltip: {
          enabled: config.plugins?.tooltip?.enabled ?? true,
          callbacks: {
            label: (context: { parsed: { y: number } }) => {
              const value = context.parsed.y;
              return `ROI: ${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
            },
            afterLabel: (context: { dataIndex: number }) => {
              const index = context.dataIndex;
              const item = data[index];
              return [
                `Profit: ${item.total_profit >= 0 ? '+' : ''}${item.total_profit.toLocaleString('hu-HU')} Ft`,
                `Win Rate: ${item.win_rate.toFixed(1)}%`,
                `Fogadások: ${item.total_bets}`,
                `Átlagos odds: ${item.average_odds.toFixed(2)}`,
              ];
            },
          },
        },
      },
      scales: {
        x: {
          display: config.scales?.x?.display ?? true,
          grid: {
            display: config.scales?.x?.grid?.display ?? false,
            color: 'hsla(0, 0%, 98%, 0.1)',
          },
          ticks: {
            color: 'hsl(0, 0%, 98%)',
          },
        },
        y: {
          display: config.scales?.y?.display ?? true,
          grid: {
            display: config.scales?.y?.grid?.display ?? true,
            color: 'hsla(0, 0%, 98%, 0.1)',
          },
          ticks: {
            color: 'hsl(0, 0%, 98%)',
            callback: (value: number) => `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`,
          },
        },
      },
    };

    return { data: chartData, options: chartOptions };
  }

  /**
   * Create win rate distribution doughnut chart
   */
  static createWinRateDistributionChart(
    data: WinRateData[],
    config: ChartConfig = {}
  ) {
    const totalBets = data.reduce((sum, item) => sum + item.total_bets, 0);
    const totalWins = data.reduce((sum, item) => sum + item.winning_bets, 0);
    const totalLosses = data.reduce((sum, item) => sum + item.losing_bets, 0);

    const chartData = {
      labels: ['Nyertes', 'Vesztes'],
      datasets: [
        {
          data: [totalWins, totalLosses],
          backgroundColor: [
            'hsla(142, 76%, 36%, 0.8)',
            'hsla(0, 84%, 60%, 0.8)',
          ],
          borderColor: [
            'hsl(142, 76%, 36%)',
            'hsl(0, 84%, 60%)',
          ],
          borderWidth: 2,
        },
      ],
    };

    const chartOptions = {
      responsive: config.responsive ?? true,
      maintainAspectRatio: config.maintainAspectRatio ?? false,
      plugins: {
        legend: {
          display: config.plugins?.legend?.display ?? true,
          position: config.plugins?.legend?.position ?? 'bottom',
          labels: {
            color: 'hsl(0, 0%, 98%)',
          },
        },
        title: {
          display: config.plugins?.title?.display ?? true,
          text: config.plugins?.title?.text ?? 'Win/Loss Distribution',
          color: 'hsl(0, 0%, 98%)',
        },
        tooltip: {
          enabled: config.plugins?.tooltip?.enabled ?? true,
          callbacks: {
            label: (context: { parsed: number; label: string }) => {
              const value = context.parsed;
              const percentage = ((value / totalBets) * 100).toFixed(1);
              return `${context.label}: ${value} (${percentage}%)`;
            },
          },
        },
      },
    };

    return { data: chartData, options: chartOptions };
  }

  /**
   * Get chart component based on type
   */
  static getChartComponent(chartType: 'line' | 'bar' | 'doughnut' | 'radar') {
    switch (chartType) {
      case 'line':
        return Line;
      case 'bar':
        return Bar;
      case 'doughnut':
        return Doughnut;
      case 'radar':
        return Radar;
      default:
        return Line;
    }
  }
}
