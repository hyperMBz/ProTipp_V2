"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { 
  Calendar as CalendarIcon,
  Filter,
  X,
  RotateCcw,
  Check
} from "lucide-react";
import { format } from "date-fns";
import { hu } from "date-fns/locale";
import { AnalyticsFilters as AnalyticsFiltersType, DateRange } from "@/lib/types/analytics";
import { getDateRangePresets } from "@/lib/utils/analytics";

interface AnalyticsFiltersProps {
  filters: AnalyticsFiltersType;
  dateRange: DateRange;
  onFiltersChange: (filters: AnalyticsFiltersType) => void;
  onDateRangeChange: (dateRange: DateRange) => void;
  className?: string;
}

export function AnalyticsFilters({
  filters,
  dateRange,
  onFiltersChange,
  onDateRangeChange,
  className
}: AnalyticsFiltersProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [tempDateRange, setTempDateRange] = useState<DateRange>(dateRange);

  // Mock adatok a szűrőkhöz
  const sports = ['Futball', 'Kosárlabda', 'Tenisz', 'Jégkorong', 'Rugby'];
  const bookmakers = ['Tippmix', 'Fortuna', 'Bet365', 'Unibet', 'Betfair'];
  const results = [
    { value: 'all', label: 'Összes' },
    { value: 'won', label: 'Nyert' },
    { value: 'lost', label: 'Vesztett' },
    { value: 'pending', label: 'Függőben' }
  ];

  const datePresets = getDateRangePresets();

  const handleSportChange = (sport: string) => {
    onFiltersChange({
      ...filters,
      sport: sport === 'all' ? undefined : sport
    });
  };

  const handleBookmakerChange = (bookmaker: string) => {
    onFiltersChange({
      ...filters,
      bookmaker: bookmaker === 'all' ? undefined : bookmaker
    });
  };

  const handleResultChange = (result: string) => {
    onFiltersChange({
      ...filters,
      result: result as any
    });
  };

  const handleDatePresetSelect = (preset: string) => {
    if (preset in datePresets) {
      onDateRangeChange(datePresets[preset as keyof typeof datePresets]);
    }
  };

  const handleCustomDateRange = () => {
    onDateRangeChange(tempDateRange);
    setIsCalendarOpen(false);
  };

  const clearFilters = () => {
    onFiltersChange({});
    onDateRangeChange(datePresets.last30days);
  };

  const hasActiveFilters = () => {
    return !!(
      filters.sport ||
      filters.bookmaker ||
      (filters.result && filters.result !== 'all') ||
      (dateRange.from.getTime() !== datePresets.last30days.from.getTime()) ||
      (dateRange.to.getTime() !== datePresets.last30days.to.getTime())
    );
  };

  return (
    <div className={className}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Date Range Filter */}
        <div className="space-y-2">
          <Label>Dátum tartomány</Label>
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(dateRange.from, "PPP", { locale: hu })} - {format(dateRange.to, "PPP", { locale: hu })}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <div className="p-4">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Gyors kiválasztás</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDatePresetSelect('today')}
                      >
                        Ma
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDatePresetSelect('yesterday')}
                      >
                        Tegnap
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDatePresetSelect('last7days')}
                      >
                        Utolsó 7 nap
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDatePresetSelect('last30days')}
                      >
                        Utolsó 30 nap
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDatePresetSelect('thisMonth')}
                      >
                        Ez a hónap
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDatePresetSelect('lastMonth')}
                      >
                        Múlt hónap
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Egyedi tartomány</Label>
                    <div className="mt-2">
                      <Calendar
                        mode="range"
                        selected={tempDateRange}
                        onSelect={(range) => {
                          if (range?.from && range?.to) {
                            setTempDateRange({ from: range.from, to: range.to });
                          }
                        }}
                        numberOfMonths={2}
                        locale={hu}
                      />
                      <div className="flex justify-end space-x-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsCalendarOpen(false)}
                        >
                          Mégse
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleCustomDateRange}
                        >
                          Alkalmaz
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Sport Filter */}
        <div className="space-y-2">
          <Label>Sport</Label>
          <Select
            value={filters.sport || 'all'}
            onValueChange={handleSportChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Válassz sportot" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Összes sport</SelectItem>
              {sports.map((sport) => (
                <SelectItem key={sport} value={sport}>
                  {sport}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Bookmaker Filter */}
        <div className="space-y-2">
          <Label>Bookmaker</Label>
          <Select
            value={filters.bookmaker || 'all'}
            onValueChange={handleBookmakerChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Válassz bookmakert" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Összes bookmaker</SelectItem>
              {bookmakers.map((bookmaker) => (
                <SelectItem key={bookmaker} value={bookmaker}>
                  {bookmaker}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Result Filter */}
        <div className="space-y-2">
          <Label>Eredmény</Label>
          <Select
            value={filters.result || 'all'}
            onValueChange={handleResultChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Válassz eredményt" />
            </SelectTrigger>
            <SelectContent>
              {results.map((result) => (
                <SelectItem key={result.value} value={result.value}>
                  {result.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters() && (
        <div className="mt-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Aktív szűrők:</Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Összes törlése
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-2">
            {filters.sport && (
              <Badge variant="secondary" className="flex items-center space-x-1">
                <span>Sport: {filters.sport}</span>
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => handleSportChange('all')}
                />
              </Badge>
            )}
            
            {filters.bookmaker && (
              <Badge variant="secondary" className="flex items-center space-x-1">
                <span>Bookmaker: {filters.bookmaker}</span>
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => handleBookmakerChange('all')}
                />
              </Badge>
            )}
            
            {filters.result && filters.result !== 'all' && (
              <Badge variant="secondary" className="flex items-center space-x-1">
                <span>Eredmény: {results.find(r => r.value === filters.result)?.label}</span>
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => handleResultChange('all')}
                />
              </Badge>
            )}
            
            {(dateRange.from.getTime() !== datePresets.last30days.from.getTime()) ||
             (dateRange.to.getTime() !== datePresets.last30days.to.getTime()) && (
              <Badge variant="secondary" className="flex items-center space-x-1">
                <span>
                  Dátum: {format(dateRange.from, "MM/dd", { locale: hu })} - {format(dateRange.to, "MM/dd", { locale: hu })}
                </span>
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => handleDatePresetSelect('last30days')}
                />
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Filter Summary */}
      <div className="mt-4 p-3 bg-muted/50 rounded-lg">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Filter className="h-4 w-4" />
          <span>
            {hasActiveFilters() 
              ? "Szűrők alkalmazva - az eredmények a kiválasztott kritériumoknak megfelelően jelennek meg"
              : "Nincsenek aktív szűrők - minden adat megjelenik"
            }
          </span>
        </div>
      </div>
    </div>
  );
}
