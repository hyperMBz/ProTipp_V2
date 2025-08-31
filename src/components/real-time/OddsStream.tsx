"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
// import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Zap,
  Clock,
  Filter,
  X
} from "lucide-react";
import { useRealTimeOdds } from "@/lib/hooks/use-real-time";
import { cn } from "@/lib/utils";

interface OddsStreamProps {
  className?: string;
  maxUpdates?: number;
  showSignificantOnly?: boolean;
  autoScroll?: boolean;
}

interface OddsUpdate {
  bookmaker_id: string;
  event_id: string;
  market: string;
  outcome: string;
  odds: number;
  timestamp: Date;
  is_significant?: boolean;
}

export function OddsStream({ 
  className,
  maxUpdates = 50,
  showSignificantOnly = false,
  autoScroll = true
}: OddsStreamProps) {
  const { oddsUpdates, clearUpdates } = useRealTimeOdds({
    autoConnect: true,
    preferredMethod: 'websocket'
  });

  const [filter, setFilter] = useState<string>('all');
  const [bookmakerFilter, setBookmakerFilter] = useState<string>('all');

  // Filter and limit updates
  const filteredUpdates = useMemo(() => {
    let filtered = oddsUpdates as OddsUpdate[];

    // Filter by significance
    if (showSignificantOnly) {
      filtered = filtered.filter(update => update.is_significant);
    }

    // Filter by type
    if (filter !== 'all') {
      filtered = filtered.filter(update => update.market === filter);
    }

    // Filter by bookmaker
    if (bookmakerFilter !== 'all') {
      filtered = filtered.filter(update => update.bookmaker_id === bookmakerFilter);
    }

    // Limit number of updates
    return filtered.slice(-maxUpdates);
  }, [oddsUpdates, showSignificantOnly, filter, bookmakerFilter, maxUpdates]);

  // Get unique bookmakers and markets for filters
  const bookmakers = useMemo(() => {
    const unique = new Set(oddsUpdates.map((update: OddsUpdate) => update.bookmaker_id));
    return Array.from(unique);
  }, [oddsUpdates]);

  const markets = useMemo(() => {
    const unique = new Set(oddsUpdates.map((update: OddsUpdate) => update.market));
    return Array.from(unique);
  }, [oddsUpdates]);

  const getOddsChangeIcon = (update: OddsUpdate, previousUpdate?: OddsUpdate) => {
    if (!previousUpdate) return <Minus className="h-3 w-3 text-gray-500" />;
    
    if (update.odds > previousUpdate.odds) {
      return <TrendingUp className="h-3 w-3 text-green-500" />;
    } else if (update.odds < previousUpdate.odds) {
      return <TrendingDown className="h-3 w-3 text-red-500" />;
    }
    
    return <Minus className="h-3 w-3 text-gray-500" />;
  };

  const getOddsChangeColor = (update: OddsUpdate, previousUpdate?: OddsUpdate) => {
    if (!previousUpdate) return 'text-gray-600';
    
    if (update.odds > previousUpdate.odds) {
      return 'text-green-600';
    } else if (update.odds < previousUpdate.odds) {
      return 'text-red-600';
    }
    
    return 'text-gray-600';
  };

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatOdds = (odds: number) => {
    return odds.toFixed(2);
  };

  const getMarketColor = (market: string) => {
    switch (market) {
      case 'h2h':
        return 'bg-blue-500/10 text-blue-600 border-blue-200';
      case 'spreads':
        return 'bg-purple-500/10 text-purple-600 border-purple-200';
      case 'totals':
        return 'bg-orange-500/10 text-orange-600 border-orange-200';
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-200';
    }
  };

  const getBookmakerColor = (bookmakerId: string) => {
    const colors = [
      'bg-red-500/10 text-red-600 border-red-200',
      'bg-green-500/10 text-green-600 border-green-200',
      'bg-blue-500/10 text-blue-600 border-blue-200',
      'bg-yellow-500/10 text-yellow-600 border-yellow-200',
      'bg-purple-500/10 text-purple-600 border-purple-200',
    ];
    
    const index = bookmakers.indexOf(bookmakerId);
    return colors[index % colors.length];
  };

  return (
    <Card className={cn("gradient-bg border-primary/20", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Zap className="h-4 w-4" />
            Real-time Odds Stream
            {filteredUpdates.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {filteredUpdates.length}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearUpdates}
              disabled={oddsUpdates.length === 0}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {/* Market Filter */}
          <div className="flex items-center gap-1">
            <Filter className="h-3 w-3 text-muted-foreground" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="text-xs bg-background border border-border rounded px-2 py-1"
            >
              <option value="all">All Markets</option>
              {markets.map(market => (
                <option key={market} value={market}>
                  {market.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Bookmaker Filter */}
          <div className="flex items-center gap-1">
            <select
              value={bookmakerFilter}
              onChange={(e) => setBookmakerFilter(e.target.value)}
              className="text-xs bg-background border border-border rounded px-2 py-1"
            >
              <option value="all">All Bookmakers</option>
              {bookmakers.map(bookmaker => (
                <option key={bookmaker} value={bookmaker}>
                  {bookmaker}
                </option>
              ))}
            </select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="h-[400px] px-4 overflow-y-auto">
          {filteredUpdates.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-muted-foreground">
              <div className="text-center">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No odds updates yet</p>
                <p className="text-xs">Updates will appear here in real-time</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredUpdates.map((update, index) => {
                const previousUpdate = index > 0 ? filteredUpdates[index - 1] : undefined;
                
                return (
                  <div
                    key={`${update.bookmaker_id}-${update.event_id}-${update.timestamp.getTime()}`}
                    className={cn(
                      "p-3 rounded-lg border transition-all duration-200",
                      update.is_significant 
                        ? "bg-yellow-50 border-yellow-200 shadow-sm" 
                        : "bg-background border-border hover:border-primary/20"
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      {/* Left side - Bookmaker and Market */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge 
                            variant="outline" 
                            className={cn("text-xs", getBookmakerColor(update.bookmaker_id))}
                          >
                            {update.bookmaker_id}
                          </Badge>
                          <Badge 
                            variant="outline" 
                            className={cn("text-xs", getMarketColor(update.market))}
                          >
                            {update.market.toUpperCase()}
                          </Badge>
                          {update.is_significant && (
                            <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                              Significant
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-sm font-medium truncate">
                          {update.outcome}
                        </p>
                        
                        <p className="text-xs text-muted-foreground truncate">
                          Event: {update.event_id}
                        </p>
                      </div>

                      {/* Right side - Odds and Time */}
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-1">
                          {getOddsChangeIcon(update, previousUpdate)}
                          <span className={cn(
                            "text-sm font-bold",
                            getOddsChangeColor(update, previousUpdate)
                          )}>
                            {formatOdds(update.odds)}
                          </span>
                        </div>
                        
                        <p className="text-xs text-muted-foreground">
                          {formatTime(update.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default OddsStream;
