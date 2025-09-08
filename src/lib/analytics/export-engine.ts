import { BetHistoryItem } from '@/lib/mock-data';
import { 
  AnalyticsDataProcessor, 
  PerformanceReport, 
  ProfitLossData, 
  ROITrendData, 
  WinRateData,
  SportPerformanceData,
  BookmakerPerformanceData 
} from './data-processor';
import type { Database } from '@/lib/supabase/client';

type BetHistory = Database['public']['Tables']['bet_history']['Row'];
type UnifiedBetHistory = BetHistoryItem | BetHistory;

export interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf';
  filename?: string;
  includeCharts?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  filters?: {
    sport?: string;
    bookmaker?: string;
    status?: string;
  };
}

export interface ExportResult {
  success: boolean;
  data?: string | Blob;
  filename: string;
  error?: string;
}

export class ExportEngine {
  /**
   * Export bet history data
   */
  static async exportBetHistory(
    betHistory: UnifiedBetHistory[],
    options: ExportOptions
  ): Promise<ExportResult> {
    try {
      const filteredData = this.filterBetHistory(betHistory, options.filters);
      
      switch (options.format) {
        case 'csv':
          return this.exportToCSV(filteredData, options);
        case 'excel':
          return this.exportToExcel(filteredData, options);
        case 'pdf':
          return this.exportToPDF(filteredData, options);
        default:
          throw new Error('Unsupported export format');
      }
    } catch (error) {
      return {
        success: false,
        filename: options.filename || 'export',
        error: error instanceof Error ? error.message : 'Export failed',
      };
    }
  }

  /**
   * Export analytics report
   */
  static async exportAnalyticsReport(
    betHistory: UnifiedBetHistory[],
    options: ExportOptions
  ): Promise<ExportResult> {
    try {
      const filteredData = this.filterBetHistory(betHistory, options.filters);
      const startDate = options.dateRange?.start || new Date(0);
      const endDate = options.dateRange?.end || new Date();
      
      const report = AnalyticsDataProcessor.generatePerformanceReport(
        filteredData,
        startDate,
        endDate,
        'monthly'
      );

      const profitLossData = AnalyticsDataProcessor.calculateProfitLossData(filteredData, 'daily');
      const roiTrends = AnalyticsDataProcessor.calculateROITrends(filteredData, 'weekly');
      const winRateData = AnalyticsDataProcessor.calculateWinRateAnalysis(filteredData, 'weekly');
      const sportPerformance = AnalyticsDataProcessor.calculateSportPerformance(filteredData);
      const bookmakerPerformance = AnalyticsDataProcessor.calculateBookmakerPerformance(filteredData);

      switch (options.format) {
        case 'csv':
          return this.exportAnalyticsToCSV(report, profitLossData, roiTrends, winRateData, sportPerformance, bookmakerPerformance, options);
        case 'excel':
          return this.exportAnalyticsToExcel(report, profitLossData, roiTrends, winRateData, sportPerformance, bookmakerPerformance, options);
        case 'pdf':
          return this.exportAnalyticsToPDF(report, profitLossData, roiTrends, winRateData, sportPerformance, bookmakerPerformance, options);
        default:
          throw new Error('Unsupported export format');
      }
    } catch (error) {
      return {
        success: false,
        filename: options.filename || 'analytics-report',
        error: error instanceof Error ? error.message : 'Export failed',
      };
    }
  }

  /**
   * Export to CSV format
   */
  private static exportToCSV(data: UnifiedBetHistory[], options: ExportOptions): ExportResult {
    const headers = [
      'ID',
      'Esemény',
      'Sport',
      'Bookmaker',
      'Odds',
      'Tét',
      'Eredmény',
      'Státusz',
      'Profit',
      'CLV',
      'Dátum',
    ];

    const csvContent = [
      headers.join(','),
      ...data.map(bet => [
        bet.id,
        `"${'event' in bet ? bet.event : bet.event_name}"`,
        bet.sport,
        bet.bookmaker,
        bet.odds,
        bet.stake,
        bet.outcome,
        bet.status,
        bet.profit || 0,
        bet.clv || 0,
        new Date('placedAt' in bet ? bet.placedAt : (bet.placed_at || bet.created_at)).toISOString(),
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const filename = `${options.filename || 'bet-history'}.csv`;

    return {
      success: true,
      data: blob,
      filename,
    };
  }

  /**
   * Export to Excel format (simplified - would need a proper Excel library in production)
   */
  private static exportToExcel(data: UnifiedBetHistory[], options: ExportOptions): ExportResult {
    // For now, we'll create a CSV with .xlsx extension
    // In production, you'd use a library like 'xlsx' or 'exceljs'
    const csvResult = this.exportToCSV(data, options);
    if (!csvResult.success) return csvResult;

    const filename = `${options.filename || 'bet-history'}.xlsx`;
    
    return {
      success: true,
      data: csvResult.data,
      filename,
    };
  }

  /**
   * Export to PDF format (simplified - would need a proper PDF library in production)
   */
  private static exportToPDF(data: UnifiedBetHistory[], options: ExportOptions): ExportResult {
    // For now, we'll create a simple HTML that can be converted to PDF
    // In production, you'd use a library like 'jsPDF' or 'puppeteer'
    const htmlContent = this.generatePDFHTML(data, options);
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
    const filename = `${options.filename || 'bet-history'}.html`;

    return {
      success: true,
      data: blob,
      filename,
    };
  }

  /**
   * Export analytics data to CSV
   */
  private static exportAnalyticsToCSV(
    report: PerformanceReport,
    profitLossData: ProfitLossData[],
    roiTrends: ROITrendData[],
    winRateData: WinRateData[],
    sportPerformance: SportPerformanceData[],
    bookmakerPerformance: BookmakerPerformanceData[],
    options: ExportOptions
  ): ExportResult {
    const sections = [
      // Performance Summary
      ['Performance Summary'],
      ['Metric', 'Value'],
      ['Total Bets', report.total_bets],
      ['Winning Bets', report.winning_bets],
      ['Total Profit', report.total_profit],
      ['ROI %', report.roi_percentage],
      ['Win Rate %', report.win_rate],
      ['Average Odds', report.average_odds],
      ['Largest Win', report.largest_win],
      ['Largest Loss', report.largest_loss],
      ['Best Sport', report.best_sport],
      ['Best Bookmaker', report.best_bookmaker],
      [''],
      
      // Profit/Loss Data
      ['Profit/Loss Data'],
      ['Date', 'Profit', 'Cumulative Profit', 'Bets Count', 'Win Rate %'],
      ...profitLossData.map(item => [
        item.date,
        item.profit,
        item.cumulative_profit,
        item.bets_count,
        item.win_rate,
      ]),
      [''],
      
      // ROI Trends
      ['ROI Trends'],
      ['Period', 'ROI %', 'Total Profit', 'Total Staked', 'Bet Count'],
      ...roiTrends.map(item => [
        item.period,
        item.roi_percentage,
        item.total_profit,
        item.total_staked,
        item.bet_count,
      ]),
      [''],
      
      // Win Rate Analysis
      ['Win Rate Analysis'],
      ['Period', 'Win Rate %', 'Total Bets', 'Winning Bets', 'Losing Bets'],
      ...winRateData.map(item => [
        item.period,
        item.win_rate,
        item.total_bets,
        item.winning_bets,
        item.losing_bets,
      ]),
      [''],
      
      // Sport Performance
      ['Sport Performance'],
      ['Sport', 'Total Bets', 'Winning Bets', 'Total Profit', 'ROI %', 'Win Rate %', 'Average Odds'],
      ...sportPerformance.map(item => [
        item.sport,
        item.total_bets,
        item.winning_bets,
        item.total_profit,
        item.roi_percentage,
        item.win_rate,
        item.average_odds,
      ]),
      [''],
      
      // Bookmaker Performance
      ['Bookmaker Performance'],
      ['Bookmaker', 'Total Bets', 'Winning Bets', 'Total Profit', 'ROI %', 'Win Rate %', 'Average Odds'],
      ...bookmakerPerformance.map(item => [
        item.bookmaker,
        item.total_bets,
        item.winning_bets,
        item.total_profit,
        item.roi_percentage,
        item.win_rate,
        item.average_odds,
      ]),
    ];

    const csvContent = sections.map(section => 
      section.map(row => 
        Array.isArray(row) 
          ? row.map(cell => typeof cell === 'string' && cell.includes(',') ? `"${cell}"` : cell).join(',')
          : row
      ).join('\n')
    ).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const filename = `${options.filename || 'analytics-report'}.csv`;

    return {
      success: true,
      data: blob,
      filename,
    };
  }

  /**
   * Export analytics data to Excel
   */
  private static exportAnalyticsToExcel(
    report: PerformanceReport,
    profitLossData: ProfitLossData[],
    roiTrends: ROITrendData[],
    winRateData: WinRateData[],
    sportPerformance: SportPerformanceData[],
    bookmakerPerformance: BookmakerPerformanceData[],
    options: ExportOptions
  ): ExportResult {
    // For now, we'll create a CSV with .xlsx extension
    // In production, you'd use a library like 'xlsx' or 'exceljs'
    const csvResult = this.exportAnalyticsToCSV(report, profitLossData, roiTrends, winRateData, sportPerformance, bookmakerPerformance, options);
    if (!csvResult.success) return csvResult;

    const filename = `${options.filename || 'analytics-report'}.xlsx`;
    
    return {
      success: true,
      data: csvResult.data,
      filename,
    };
  }

  /**
   * Export analytics data to PDF
   */
  private static exportAnalyticsToPDF(
    report: PerformanceReport,
    profitLossData: ProfitLossData[],
    roiTrends: ROITrendData[],
    winRateData: WinRateData[],
    sportPerformance: SportPerformanceData[],
    bookmakerPerformance: BookmakerPerformanceData[],
    options: ExportOptions
  ): ExportResult {
    const htmlContent = this.generateAnalyticsPDFHTML(
      report,
      profitLossData,
      roiTrends,
      winRateData,
      sportPerformance,
      bookmakerPerformance,
      options
    );
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
    const filename = `${options.filename || 'analytics-report'}.html`;

    return {
      success: true,
      data: blob,
      filename,
    };
  }

  /**
   * Filter bet history based on options
   */
  private static filterBetHistory(
    betHistory: UnifiedBetHistory[],
    filters?: ExportOptions['filters']
  ): UnifiedBetHistory[] {
    if (!filters) return betHistory;

    return betHistory.filter(bet => {
      if (filters.sport && bet.sport !== filters.sport) return false;
      if (filters.bookmaker && bet.bookmaker !== filters.bookmaker) return false;
      if (filters.status && bet.status !== filters.status) return false;
      return true;
    });
  }

  /**
   * Generate HTML for PDF export
   */
  private static generatePDFHTML(data: UnifiedBetHistory[], options: ExportOptions): string {
    const totalBets = data.length;
    const winningBets = data.filter(bet => bet.status === 'won').length;
    const totalProfit = data.reduce((sum, bet) => sum + (bet.profit || 0), 0);
    const totalStaked = data.reduce((sum, bet) => sum + bet.stake, 0);
    const roiPercentage = totalStaked > 0 ? (totalProfit / totalStaked) * 100 : 0;

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Bet History Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .summary { margin-bottom: 30px; }
            .summary table { width: 100%; border-collapse: collapse; }
            .summary th, .summary td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .summary th { background-color: #f2f2f2; }
            .bets-table { width: 100%; border-collapse: collapse; }
            .bets-table th, .bets-table td { border: 1px solid #ddd; padding: 6px; text-align: left; font-size: 12px; }
            .bets-table th { background-color: #f2f2f2; }
            .profit-positive { color: green; }
            .profit-negative { color: red; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Bet History Report</h1>
            <p>Generated on: ${new Date().toLocaleString('hu-HU')}</p>
          </div>
          
          <div class="summary">
            <h2>Summary</h2>
            <table>
              <tr><th>Metric</th><th>Value</th></tr>
              <tr><td>Total Bets</td><td>${totalBets}</td></tr>
              <tr><td>Winning Bets</td><td>${winningBets}</td></tr>
              <tr><td>Win Rate</td><td>${totalBets > 0 ? ((winningBets / totalBets) * 100).toFixed(1) : 0}%</td></tr>
              <tr><td>Total Profit</td><td class="${totalProfit >= 0 ? 'profit-positive' : 'profit-negative'}">${totalProfit >= 0 ? '+' : ''}${totalProfit.toLocaleString('hu-HU')} Ft</td></tr>
              <tr><td>Total Staked</td><td>${totalStaked.toLocaleString('hu-HU')} Ft</td></tr>
              <tr><td>ROI</td><td class="${roiPercentage >= 0 ? 'profit-positive' : 'profit-negative'}">${roiPercentage >= 0 ? '+' : ''}${roiPercentage.toFixed(2)}%</td></tr>
            </table>
          </div>
          
          <div class="bets">
            <h2>Bet Details</h2>
            <table class="bets-table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Sport</th>
                  <th>Bookmaker</th>
                  <th>Odds</th>
                  <th>Stake</th>
                  <th>Status</th>
                  <th>Profit</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                ${data.map(bet => `
                  <tr>
                    <td>${'event' in bet ? bet.event : bet.event_name}</td>
                    <td>${bet.sport}</td>
                    <td>${bet.bookmaker}</td>
                    <td>${bet.odds}</td>
                    <td>${bet.stake.toLocaleString('hu-HU')} Ft</td>
                    <td>${bet.status}</td>
                    <td class="${(bet.profit || 0) >= 0 ? 'profit-positive' : 'profit-negative'}">${(bet.profit || 0) >= 0 ? '+' : ''}${(bet.profit || 0).toLocaleString('hu-HU')} Ft</td>
                    <td>${new Date('placedAt' in bet ? bet.placedAt : (bet.placed_at || bet.created_at)).toLocaleDateString('hu-HU')}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Generate HTML for analytics PDF export
   */
  private static generateAnalyticsPDFHTML(
    report: PerformanceReport,
    profitLossData: ProfitLossData[],
    roiTrends: ROITrendData[],
    winRateData: WinRateData[],
    sportPerformance: SportPerformanceData[],
    bookmakerPerformance: BookmakerPerformanceData[],
    options: ExportOptions
  ): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Analytics Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .section { margin-bottom: 30px; }
            .section table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            .section th, .section td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .section th { background-color: #f2f2f2; }
            .profit-positive { color: green; }
            .profit-negative { color: red; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Analytics Report</h1>
            <p>Generated on: ${new Date().toLocaleString('hu-HU')}</p>
            <p>Period: ${report.start_date.toLocaleDateString('hu-HU')} - ${report.end_date.toLocaleDateString('hu-HU')}</p>
          </div>
          
          <div class="section">
            <h2>Performance Summary</h2>
            <table>
              <tr><th>Metric</th><th>Value</th></tr>
              <tr><td>Total Bets</td><td>${report.total_bets}</td></tr>
              <tr><td>Winning Bets</td><td>${report.winning_bets}</td></tr>
              <tr><td>Total Profit</td><td class="${report.total_profit >= 0 ? 'profit-positive' : 'profit-negative'}">${report.total_profit >= 0 ? '+' : ''}${report.total_profit.toLocaleString('hu-HU')} Ft</td></tr>
              <tr><td>ROI %</td><td class="${report.roi_percentage >= 0 ? 'profit-positive' : 'profit-negative'}">${report.roi_percentage >= 0 ? '+' : ''}${report.roi_percentage.toFixed(2)}%</td></tr>
              <tr><td>Win Rate %</td><td>${report.win_rate.toFixed(1)}%</td></tr>
              <tr><td>Average Odds</td><td>${report.average_odds.toFixed(2)}</td></tr>
              <tr><td>Largest Win</td><td class="profit-positive">+${report.largest_win.toLocaleString('hu-HU')} Ft</td></tr>
              <tr><td>Largest Loss</td><td class="profit-negative">${report.largest_loss.toLocaleString('hu-HU')} Ft</td></tr>
              <tr><td>Best Sport</td><td>${report.best_sport}</td></tr>
              <tr><td>Best Bookmaker</td><td>${report.best_bookmaker}</td></tr>
            </table>
          </div>
          
          <div class="section">
            <h2>Sport Performance</h2>
            <table>
              <thead>
                <tr>
                  <th>Sport</th>
                  <th>Total Bets</th>
                  <th>Winning Bets</th>
                  <th>Total Profit</th>
                  <th>ROI %</th>
                  <th>Win Rate %</th>
                  <th>Average Odds</th>
                </tr>
              </thead>
              <tbody>
                ${sportPerformance.map(sport => `
                  <tr>
                    <td>${sport.sport}</td>
                    <td>${sport.total_bets}</td>
                    <td>${sport.winning_bets}</td>
                    <td class="${sport.total_profit >= 0 ? 'profit-positive' : 'profit-negative'}">${sport.total_profit >= 0 ? '+' : ''}${sport.total_profit.toLocaleString('hu-HU')} Ft</td>
                    <td class="${sport.roi_percentage >= 0 ? 'profit-positive' : 'profit-negative'}">${sport.roi_percentage >= 0 ? '+' : ''}${sport.roi_percentage.toFixed(2)}%</td>
                    <td>${sport.win_rate.toFixed(1)}%</td>
                    <td>${sport.average_odds.toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          
          <div class="section">
            <h2>Bookmaker Performance</h2>
            <table>
              <thead>
                <tr>
                  <th>Bookmaker</th>
                  <th>Total Bets</th>
                  <th>Winning Bets</th>
                  <th>Total Profit</th>
                  <th>ROI %</th>
                  <th>Win Rate %</th>
                  <th>Average Odds</th>
                </tr>
              </thead>
              <tbody>
                ${bookmakerPerformance.map(bm => `
                  <tr>
                    <td>${bm.bookmaker}</td>
                    <td>${bm.total_bets}</td>
                    <td>${bm.winning_bets}</td>
                    <td class="${bm.total_profit >= 0 ? 'profit-positive' : 'profit-negative'}">${bm.total_profit >= 0 ? '+' : ''}${bm.total_profit.toLocaleString('hu-HU')} Ft</td>
                    <td class="${bm.roi_percentage >= 0 ? 'profit-positive' : 'profit-negative'}">${bm.roi_percentage >= 0 ? '+' : ''}${bm.roi_percentage.toFixed(2)}%</td>
                    <td>${bm.win_rate.toFixed(1)}%</td>
                    <td>${bm.average_odds.toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Download file from blob
   */
  static downloadFile(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
