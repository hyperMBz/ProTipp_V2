"use client";

import React, { useState, useCallback } from 'react';
import { DashboardWidget, WidgetWrapper } from "@/components/dashboard/DashboardWidget";
import { ArbitrageTable } from "@/components/ArbitrageTable";
import { BetTrackerProvider } from "@/components/bet-tracker/BetTrackerProvider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  TrendingUp, 
  Filter, 
  Search, 
  RefreshCw,
  Eye,
  EyeOff,
  Maximize2,
  Settings
} from "lucide-react";
import { useArbitrageWithFallback } from "@/lib/hooks/use-odds-data";
import { sportsCategories, profitRanges, stakeRanges, timeFilters } from "@/lib/mock-data";
import { formatNumber } from "@/lib/utils";

interface ArbitrageWidgetProps {
  id: string;
  title?: string;
  description?: string;
  className?: string;
  onRefresh?: () => void;
  onMaximize?: () => void;
  onMinimize?: () => void;
  onSettings?: () => void;
  isMaximized?: boolean;
  showFilters?: boolean;
  showSearch?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function ArbitrageWidget({
  id,
  title = "Arbitrage Lehetőségek",
  description = "Valós idejű arbitrage lehetőségek",
  className,
  onRefresh,
  onMaximize,
  onMinimize,
  onSettings,
  isMaximized = false,
  showFilters = true,
  showSearch = true,
  autoRefresh = true,
  refreshInterval = 30000
}: ArbitrageWidgetProps) {
  const [selectedSport, setSelectedSport] = useState("Összes");
  const [selectedProfitRange, setSelectedProfitRange] = useState("Összes");
  const [selectedStakeRange, setSelectedStakeRange] = useState("Összes");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // API hook használata
  const arbitrageQuery = useArbitrageWithFallback(['soccer_epl', 'basketball_nba', 'tennis_atp']);

  // Refresh kezelése
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    arbitrageQuery.refetch();
    onRefresh?.();
    setTimeout(() => setIsRefreshing(false), 1000);
  }, [arbitrageQuery, onRefresh]);

  // Adatok szűrése
  const opportunities = arbitrageQuery.data || [];
  const isLoading = arbitrageQuery.isLoading;
  const error = arbitrageQuery.error;

  const filteredOpportunities = opportunities.filter(opp => {
    const sportMatch = selectedSport === "Összes" || opp.sport === selectedSport;
    
    const profitRange = profitRanges.find(range => range.label === selectedProfitRange);
    const profitMatch = !profitRange || (opp.profitMargin >= profitRange.min && opp.profitMargin <= profitRange.max);
    
    const stakeRange = stakeRanges.find(range => range.label === selectedStakeRange);
    const stakeMatch = !stakeRange || (opp.totalStake >= stakeRange.min && opp.totalStake <= stakeRange.max);
    
    const searchMatch = searchTerm === "" ||
      opp.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.outcome.toLowerCase().includes(searchTerm.toLowerCase());

    return sportMatch && profitMatch && stakeMatch && searchMatch;
  });

  // Statisztikák számítása
  const totalOpportunities = filteredOpportunities.length;
  const avgProfitMargin = totalOpportunities > 0 
    ? filteredOpportunities.reduce((sum, opp) => sum + opp.profitMargin, 0) / totalOpportunities 
    : 0;
  const maxProfitMargin = totalOpportunities > 0 
    ? Math.max(...filteredOpportunities.map(opp => opp.profitMargin)) 
    : 0;

  // Widget content
  const widgetContent = (
    <WidgetWrapper>
      <div className="h-full flex flex-col">
        {/* Header Stats */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-lg font-bold text-primary">{totalOpportunities}</div>
              <div className="text-xs text-muted-foreground">Lehetőség</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-400">{avgProfitMargin.toFixed(2)}%</div>
              <div className="text-xs text-muted-foreground">Átlag profit</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-yellow-400">{maxProfitMargin.toFixed(2)}%</div>
              <div className="text-xs text-muted-foreground">Max profit</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {showFilters && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              >
                <Filter className="h-3 w-3 mr-1" />
                Szűrők
              </Button>
            )}
          </div>
        </div>

        {/* Filters */}
        {showAdvancedFilters && (
          <div className="mb-3 p-3 border border-border rounded-lg bg-card/50 space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Select value={selectedSport} onValueChange={(value: string) => setSelectedSport(value)}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Sport" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Összes">Összes sport</SelectItem>
                                     {sportsCategories.map(sport => (
                     <SelectItem key={sport} value={sport}>
                       {sport}
                     </SelectItem>
                   ))}
                </SelectContent>
              </Select>

              <Select value={selectedProfitRange} onValueChange={(value: string) => setSelectedProfitRange(value)}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Profit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Összes">Összes profit</SelectItem>
                  {profitRanges.map(range => (
                    <SelectItem key={range.label} value={range.label}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedStakeRange} onValueChange={(value: string) => setSelectedStakeRange(value)}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Tét" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Összes">Összes tét</SelectItem>
                  {stakeRanges.map(range => (
                    <SelectItem key={range.label} value={range.label}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {showSearch && (
                <Input
                  placeholder="Keresés..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-8 text-xs"
                />
              )}
            </div>
          </div>
        )}

        {/* Table */}
        <div className="flex-1 min-h-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <RefreshCw className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
                <div className="text-sm text-muted-foreground">Betöltés...</div>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-sm text-red-400 mb-2">Hiba történt</div>
                <Button size="sm" onClick={handleRefresh}>
                  Újrapróbálkozás
                </Button>
              </div>
            </div>
          ) : (
            <div className="h-full overflow-hidden">
              <BetTrackerProvider>
                <ArbitrageTable
                  opportunities={filteredOpportunities.slice(0, isMaximized ? 20 : 5)}
                  // compact={!isMaximized}
                  // showPagination={false}
                />
              </BetTrackerProvider>
            </div>
          )}
        </div>

        {/* Footer */}
        {!isMaximized && totalOpportunities > 5 && (
          <div className="mt-2 pt-2 border-t border-border">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{totalOpportunities - 5} további lehetőség</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={onMaximize}
              >
                <Maximize2 className="h-3 w-3 mr-1" />
                Összes megjelenítése
              </Button>
            </div>
          </div>
        )}
      </div>
    </WidgetWrapper>
  );

  return (
    <DashboardWidget
      id={id}
      title={title}
      description={description}
      type="arbitrage"
      status={isLoading ? 'loading' : error ? 'error' : 'success'}
      onRefresh={handleRefresh}
      onMaximize={onMaximize}
      onMinimize={onMinimize}
      onSettings={onSettings}
      isMaximized={isMaximized}
      isRefreshing={isRefreshing}
      showControls={true}
      showStatus={true}
      error={error?.message}
      lastUpdated={new Date()}
      refreshInterval={autoRefresh ? refreshInterval : undefined}
      className={className}
    >
      {widgetContent}
    </DashboardWidget>
  );
}
