export interface ArbitrageOpportunity {
  id: string;
  sport: string;
  event: string;
  outcome: string;
  profitMargin: number;
  bet1: {
    bookmaker: string;
    odds: number;
    outcome: string;
  };
  bet2: {
    bookmaker: string;
    odds: number;
    outcome: string;
  };
  stakes: {
    bet1: {
      stake: number;
      profit: number;
    };
    bet2: {
      stake: number;
      profit: number;
    };
  };
  totalStake: number;
  expectedProfit: number;
  timeToExpiry: string;
  probability: number;
  ev?: number; // Expected Value percentage
  category: 'arbitrage' | 'positive-ev' | 'negative-ev';
}

export interface BetHistoryItem {
  id: string;
  event: string;
  sport: string;
  bookmaker: string;
  odds: number;
  stake: number;
  outcome: string;
  status: 'pending' | 'won' | 'lost' | 'refunded' | 'cancelled';
  placedAt: Date;
  settledAt?: Date;
  profit?: number;
  clv?: number; // Closing Line Value
}

export interface OddsComparison {
  id: string;
  sport: string;
  event: string;
  market: string;
  odds: {
    [bookmaker: string]: {
      outcome1: number;
      outcome2: number;
      outcomeDraw?: number;
    };
  };
  bestOdds: {
    outcome1: { bookmaker: string; odds: number };
    outcome2: { bookmaker: string; odds: number };
    outcomeDraw?: { bookmaker: string; odds: number };
  };
}

export const sportsCategories = [
  "Összes",
  "Labdarúgás",
  "Kosárlabda",
  "Tenisz",
  "Amerikai Futball",
  "Baseball",
  "Jégkorong",
  "Ökölvívás",
  "MMA",
  "Esports",
  "Golf",
  "Darts",
  "Snooker",
  "Motorsport",
  "Krikett"
];

export const profitRanges = [
  { label: "Összes", min: 0, max: 100 },
  { label: "1-3%", min: 1, max: 3 },
  { label: "3-5%", min: 3, max: 5 },
  { label: "5-10%", min: 5, max: 10 },
  { label: "10%+", min: 10, max: 100 }
];

export const stakeRanges = [
  { label: "Összes", min: 0, max: Infinity },
  { label: "10K-50K Ft", min: 10000, max: 50000 },
  { label: "50K-100K Ft", min: 50000, max: 100000 },
  { label: "100K-250K Ft", min: 100000, max: 250000 },
  { label: "250K+ Ft", min: 250000, max: Infinity }
];

export const timeFilters = [
  { label: "Összes", hours: Infinity },
  { label: "1 órán belül", hours: 1 },
  { label: "6 órán belül", hours: 6 },
  { label: "24 órán belül", hours: 24 },
  { label: "1 héten belül", hours: 168 }
];

export const bookmakers = [
  "Bet365",
  "Unibet",
  "Tipico",
  "1xBet",
  "Betfair",
  "Pinnacle",
  "William Hill",
  "Bwin",
  "888Sport",
  "LeoVegas",
  "Betsson",
  "ComeOn",
  "Sportingbet"
];

export const mockArbitrageOpportunities: ArbitrageOpportunity[] = [
  {
    id: "1",
    sport: "Labdarúgás",
    event: "Manchester United vs Arsenal",
    outcome: "Győztes",
    profitMargin: 4.2,
    bet1: {
      bookmaker: "Bet365",
      odds: 2.10,
      outcome: "Manchester United"
    },
    bet2: {
      bookmaker: "Pinnacle",
      odds: 2.05,
      outcome: "Arsenal"
    },
    stakes: {
      bet1: {
        stake: 47500,
        profit: 99750
      },
      bet2: {
        stake: 52500,
        profit: 107625
      }
    },
    totalStake: 100000,
    expectedProfit: 4200,
    timeToExpiry: "12:45:30",
    probability: 98.2,
    category: 'arbitrage'
  },
  {
    id: "2",
    sport: "Tenisz",
    event: "Novak Djokovic vs Rafael Nadal",
    outcome: "Győztes",
    profitMargin: 2.8,
    bet1: {
      bookmaker: "Unibet",
      odds: 1.85,
      outcome: "Djokovic"
    },
    bet2: {
      bookmaker: "Betfair",
      odds: 2.15,
      outcome: "Nadal"
    },
    stakes: {
      bet1: {
        stake: 53800,
        profit: 99530
      },
      bet2: {
        stake: 46200,
        profit: 99330
      }
    },
    totalStake: 100000,
    expectedProfit: 2800,
    timeToExpiry: "08:22:15",
    probability: 96.7,
    category: 'arbitrage'
  },
  {
    id: "3",
    sport: "Kosárlabda",
    event: "Lakers vs Warriors",
    outcome: "Pont Spread (-5.5)",
    profitMargin: 6.1,
    bet1: {
      bookmaker: "William Hill",
      odds: 1.95,
      outcome: "Lakers -5.5"
    },
    bet2: {
      bookmaker: "1xBet",
      odds: 1.92,
      outcome: "Warriors +5.5"
    },
    stakes: {
      bet1: {
        stake: 49600,
        profit: 96720
      },
      bet2: {
        stake: 50400,
        profit: 96768
      }
    },
    totalStake: 100000,
    expectedProfit: 6100,
    timeToExpiry: "02:18:42",
    probability: 94.1,
    category: 'arbitrage'
  },
  {
    id: "4",
    sport: "Ökölvívás",
    event: "Tyson Fury vs Anthony Joshua",
    outcome: "Knockout Victory",
    profitMargin: 8.7,
    bet1: {
      bookmaker: "Tipico",
      odds: 3.50,
      outcome: "Fury by KO"
    },
    bet2: {
      bookmaker: "Betsson",
      odds: 1.65,
      outcome: "Nem KO"
    },
    stakes: {
      bet1: {
        stake: 28600,
        profit: 100100
      },
      bet2: {
        stake: 71400,
        profit: 117810
      }
    },
    totalStake: 100000,
    expectedProfit: 8700,
    timeToExpiry: "15:30:12",
    probability: 91.3,
    category: 'arbitrage'
  },
  {
    id: "5",
    sport: "MMA",
    event: "Jon Jones vs Stipe Miocic",
    outcome: "Method of Victory",
    profitMargin: 5.4,
    bet1: {
      bookmaker: "888Sport",
      odds: 2.80,
      outcome: "Jones by Submission"
    },
    bet2: {
      bookmaker: "LeoVegas",
      odds: 1.75,
      outcome: "Nem Submission"
    },
    stakes: {
      bet1: {
        stake: 38500,
        profit: 107800
      },
      bet2: {
        stake: 61500,
        profit: 107625
      }
    },
    totalStake: 100000,
    expectedProfit: 5400,
    timeToExpiry: "23:45:08",
    probability: 93.8,
    category: 'arbitrage'
  },
  {
    id: "6",
    sport: "Baseball",
    event: "Yankees vs Red Sox",
    outcome: "Total Runs Over/Under 8.5",
    profitMargin: 3.2,
    bet1: {
      bookmaker: "Bet365",
      odds: 2.05,
      outcome: "Over 8.5"
    },
    bet2: {
      bookmaker: "Pinnacle",
      odds: 1.95,
      outcome: "Under 8.5"
    },
    stakes: {
      bet1: {
        stake: 48800,
        profit: 100040
      },
      bet2: {
        stake: 51200,
        profit: 99840
      }
    },
    totalStake: 100000,
    expectedProfit: 3200,
    timeToExpiry: "04:12:33",
    probability: 97.5,
    category: 'arbitrage'
  },
  {
    id: "7",
    sport: "Esports",
    event: "FaZe vs Navi (CS2)",
    outcome: "Map Winner",
    profitMargin: 7.8,
    bet1: {
      bookmaker: "ComeOn",
      odds: 2.40,
      outcome: "FaZe"
    },
    bet2: {
      bookmaker: "Bwin",
      odds: 1.70,
      outcome: "Navi"
    },
    stakes: {
      bet1: {
        stake: 41500,
        profit: 99600
      },
      bet2: {
        stake: 58500,
        profit: 99450
      }
    },
    totalStake: 100000,
    expectedProfit: 7800,
    timeToExpiry: "01:33:47",
    probability: 89.2,
    category: 'arbitrage'
  },
  {
    id: "8",
    sport: "Golf",
    event: "US Open 2024",
    outcome: "Tournament Winner",
    profitMargin: -2.3,
    ev: 5.8,
    bet1: {
      bookmaker: "Sportingbet",
      odds: 12.00,
      outcome: "Rory McIlroy"
    },
    bet2: {
      bookmaker: "Betfair",
      odds: 1.08,
      outcome: "Field (Not McIlroy)"
    },
    stakes: {
      bet1: {
        stake: 8330,
        profit: 99960
      },
      bet2: {
        stake: 91670,
        profit: 98983
      }
    },
    totalStake: 100000,
    expectedProfit: -2300,
    timeToExpiry: "48:15:22",
    probability: 85.6,
    category: 'positive-ev'
  },
  {
    id: "9",
    sport: "Darts",
    event: "Michael van Gerwen vs Gerwyn Price",
    outcome: "180s Hit",
    profitMargin: 1.7,
    bet1: {
      bookmaker: "William Hill",
      odds: 1.90,
      outcome: "Over 25.5 180s"
    },
    bet2: {
      bookmaker: "Unibet",
      odds: 2.10,
      outcome: "Under 25.5 180s"
    },
    stakes: {
      bet1: {
        stake: 52500,
        profit: 99750
      },
      bet2: {
        stake: 47500,
        profit: 99750
      }
    },
    totalStake: 100000,
    expectedProfit: 1700,
    timeToExpiry: "03:47:19",
    probability: 98.9,
    category: 'arbitrage'
  },
  {
    id: "10",
    sport: "Motorsport",
    event: "F1 Monaco GP",
    outcome: "Podium Finish",
    profitMargin: -1.8,
    ev: 8.2,
    bet1: {
      bookmaker: "1xBet",
      odds: 4.50,
      outcome: "Leclerc Podium"
    },
    bet2: {
      bookmaker: "Tipico",
      odds: 1.25,
      outcome: "Leclerc No Podium"
    },
    stakes: {
      bet1: {
        stake: 22200,
        profit: 99900
      },
      bet2: {
        stake: 77800,
        profit: 97450
      }
    },
    totalStake: 100000,
    expectedProfit: -1800,
    timeToExpiry: "72:23:45",
    probability: 82.4,
    category: 'positive-ev'
  }
];

export const mockBetHistory: BetHistoryItem[] = [
  {
    id: "bet_001",
    event: "Barcelona vs Real Madrid",
    sport: "Labdarúgás",
    bookmaker: "Bet365",
    odds: 2.15,
    stake: 50000,
    outcome: "Barcelona Win",
    status: 'won',
    placedAt: new Date('2024-01-15T14:30:00'),
    settledAt: new Date('2024-01-15T16:45:00'),
    profit: 57500,
    clv: 12.5
  },
  {
    id: "bet_002",
    event: "Lakers vs Celtics",
    sport: "Kosárlabda",
    bookmaker: "Pinnacle",
    odds: 1.85,
    stake: 75000,
    outcome: "Lakers -3.5",
    status: 'lost',
    placedAt: new Date('2024-01-14T19:15:00'),
    settledAt: new Date('2024-01-14T22:30:00'),
    profit: -75000,
    clv: -3.2
  },
  {
    id: "bet_003",
    event: "Djokovic vs Sinner",
    sport: "Tenisz",
    bookmaker: "William Hill",
    odds: 3.20,
    stake: 25000,
    outcome: "Djokovic Win",
    status: 'pending',
    placedAt: new Date('2024-01-16T10:00:00'),
    clv: 8.7
  },
  {
    id: "bet_004",
    event: "Fury vs Wilder III",
    sport: "Ökölvívás",
    bookmaker: "Unibet",
    odds: 2.80,
    stake: 40000,
    outcome: "Fury by KO",
    status: 'won',
    placedAt: new Date('2024-01-12T20:45:00'),
    settledAt: new Date('2024-01-12T23:15:00'),
    profit: 72000,
    clv: 15.3
  },
  {
    id: "bet_005",
    event: "FaZe vs Astralis",
    sport: "Esports",
    bookmaker: "LeoVegas",
    odds: 1.95,
    stake: 60000,
    outcome: "FaZe +1.5 Maps",
    status: 'refunded',
    placedAt: new Date('2024-01-13T16:20:00'),
    settledAt: new Date('2024-01-13T18:00:00'),
    profit: 0,
    clv: 0
  },
  {
    id: "bet_006",
    event: "Jon Jones vs Gane",
    sport: "MMA",
    bookmaker: "888Sport",
    odds: 1.65,
    stake: 80000,
    outcome: "Jones Win",
    status: 'won',
    placedAt: new Date('2024-01-11T21:30:00'),
    settledAt: new Date('2024-01-11T23:45:00'),
    profit: 52000,
    clv: 6.8
  },
  {
    id: "bet_007",
    event: "Yankees vs Dodgers",
    sport: "Baseball",
    bookmaker: "Betfair",
    odds: 2.45,
    stake: 35000,
    outcome: "Over 9.5 Runs",
    status: 'lost',
    placedAt: new Date('2024-01-10T18:15:00'),
    settledAt: new Date('2024-01-10T21:30:00'),
    profit: -35000,
    clv: -5.4
  },
  {
    id: "bet_008",
    event: "Max Verstappen Championship",
    sport: "Motorsport",
    bookmaker: "Tipico",
    odds: 1.25,
    stake: 120000,
    outcome: "Verstappen WDC",
    status: 'won',
    placedAt: new Date('2024-01-08T12:00:00'),
    settledAt: new Date('2024-01-08T14:30:00'),
    profit: 30000,
    clv: 4.2
  }
];

export const mockOddsComparisons: OddsComparison[] = [
  {
    id: "1",
    sport: "Labdarúgás",
    event: "Chelsea vs Liverpool",
    market: "1X2",
    odds: {
      "Bet365": { outcome1: 2.10, outcome2: 1.85, outcomeDraw: 3.40 },
      "Unibet": { outcome1: 2.05, outcome2: 1.90, outcomeDraw: 3.30 },
      "Pinnacle": { outcome1: 2.15, outcome2: 1.82, outcomeDraw: 3.45 },
      "William Hill": { outcome1: 2.08, outcome2: 1.88, outcomeDraw: 3.35 }
    },
    bestOdds: {
      outcome1: { bookmaker: "Pinnacle", odds: 2.15 },
      outcome2: { bookmaker: "Unibet", odds: 1.90 },
      outcomeDraw: { bookmaker: "Pinnacle", odds: 3.45 }
    }
  },
  {
    id: "2",
    sport: "Tenisz",
    event: "Federer vs Murray",
    market: "Match Winner",
    odds: {
      "Bet365": { outcome1: 1.75, outcome2: 2.20 },
      "Betfair": { outcome1: 1.78, outcome2: 2.15 },
      "1xBet": { outcome1: 1.72, outcome2: 2.25 },
      "Tipico": { outcome1: 1.76, outcome2: 2.18 }
    },
    bestOdds: {
      outcome1: { bookmaker: "Betfair", odds: 1.78 },
      outcome2: { bookmaker: "1xBet", odds: 2.25 }
    }
  },
  {
    id: "3",
    sport: "MMA",
    event: "UFC Main Event",
    market: "Method of Victory",
    odds: {
      "888Sport": { outcome1: 3.20, outcome2: 2.80 },
      "LeoVegas": { outcome1: 3.15, outcome2: 2.85 },
      "Bwin": { outcome1: 3.25, outcome2: 2.75 },
      "ComeOn": { outcome1: 3.10, outcome2: 2.90 }
    },
    bestOdds: {
      outcome1: { bookmaker: "Bwin", odds: 3.25 },
      outcome2: { bookmaker: "ComeOn", odds: 2.90 }
    }
  }
];

// Utility functions
export function generateRandomOdds(min: number = 1.5, max: number = 3.0): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

export function calculateImpliedProbability(odds: number): number {
  return Math.round((1 / odds) * 100 * 100) / 100;
}

export function calculateArbitrageProfit(odds1: number, odds2: number): number {
  const impliedProb1 = 1 / odds1;
  const impliedProb2 = 1 / odds2;
  const totalImpliedProb = impliedProb1 + impliedProb2;

  if (totalImpliedProb < 1) {
    return Math.round(((1 - totalImpliedProb) * 100) * 100) / 100;
  }
  return 0;
}

export function calculateEV(odds: number, trueProbability: number): number {
  return Math.round(((odds * trueProbability - 1) * 100) * 100) / 100;
}

export function getTimeToExpiryInHours(timeString: string): number {
  const [hours, minutes, seconds] = timeString.split(':').map(Number);
  return hours + minutes / 60 + seconds / 3600;
}
