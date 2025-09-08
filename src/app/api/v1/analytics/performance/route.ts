import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/v1/analytics/performance
 * Performance analytics lekérdezése
 */
export async function GET(request: NextRequest) {
  try {
    // Mock performance analytics data
    const performanceData = {
      totalBets: 150,
      successfulBets: 142,
      totalProfit: 2847.50,
      profitPercentage: 18.98,
      averageOdds: 2.15,
      winRate: 94.67,
      monthlyStats: [
        { month: '2024-01', profit: 1200.50, bets: 45 },
        { month: '2024-02', profit: 980.25, bets: 38 },
        { month: '2024-03', profit: 666.75, bets: 42 },
        { month: '2024-04', profit: 0, bets: 25 }
      ],
      topSports: [
        { sport: 'Football', profit: 1200.50, percentage: 42.1 },
        { sport: 'Basketball', profit: 800.25, percentage: 28.1 },
        { sport: 'Tennis', profit: 500.75, percentage: 17.6 },
        { sport: 'Other', profit: 346.00, percentage: 12.2 }
      ],
      riskMetrics: {
        maxDrawdown: 5.2,
        sharpeRatio: 2.8,
        volatility: 12.5
      }
    };

    return NextResponse.json({
      success: true,
      data: performanceData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Analytics performance API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch performance analytics',
        message: 'Internal server error'
      },
      { status: 500 }
    );
  }
}
