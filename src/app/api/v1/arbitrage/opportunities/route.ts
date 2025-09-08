import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/v1/arbitrage/opportunities
 * Arbitrage opportunities lekérdezése
 */
export async function GET(request: NextRequest) {
  try {
    // Mock arbitrage opportunities data
    const opportunities = [
      {
        id: '1',
        sport: 'Football',
        match: 'Team A vs Team B',
        bet1: {
          bookmaker: 'Bookmaker 1',
          odds: 2.1,
          market: 'Home Win'
        },
        bet2: {
          bookmaker: 'Bookmaker 2',
          odds: 2.0,
          market: 'Away Win'
        },
        profit: 5.2,
        profitPercentage: 2.4,
        timestamp: new Date().toISOString()
      },
      {
        id: '2',
        sport: 'Basketball',
        match: 'Team C vs Team D',
        bet1: {
          bookmaker: 'Bookmaker 3',
          odds: 1.8,
          market: 'Over 2.5'
        },
        bet2: {
          bookmaker: 'Bookmaker 4',
          odds: 2.2,
          market: 'Under 2.5'
        },
        profit: 3.8,
        profitPercentage: 1.9,
        timestamp: new Date().toISOString()
      }
    ];

    return NextResponse.json({
      success: true,
      data: opportunities,
      count: opportunities.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Arbitrage opportunities API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch arbitrage opportunities',
        message: 'Internal server error'
      },
      { status: 500 }
    );
  }
}
