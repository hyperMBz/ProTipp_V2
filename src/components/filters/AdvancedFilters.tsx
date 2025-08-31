"use client";

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Filter, 
  X, 
  Search, 
  RefreshCw, 
  Save, 
  Loader2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  Target,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

// Filter típusok
export interface FilterOption {
  id: string;
  label: string;
  value: string | number | boolean;
  type: 'text' | 'number' | 'select' | 'slider' | 'checkbox' | 'switch';
  options?: { label: string; value: string | number }[];
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

// Filter kategóriák
export interface FilterCategory {
  id: string;
  label: string;
  icon?: React.ReactNode;
  filters: FilterOption[];
  isExpanded?: boolean;
}

// Filter props
interface AdvancedFiltersProps {
  categories: FilterCategory[];
  onFiltersChange?: (filters: Record<string, unknown>) => void;
  onApply?: (filters: Record<string, unknown>) => void;
  onReset?: () => void;
  onSave?: (name: string, filters: Record<string, unknown>) => void;
  onLoad?: (name: string) => void;
  savedFilters?: { name: string; filters: Record<string, unknown> }[];
  className?: string;
  showSearch?: boolean;
  showSaveLoad?: boolean;
  showReset?: boolean;
  showApply?: boolean;
  isCollapsible?: boolean;
  defaultExpanded?: boolean;
}

export function AdvancedFilters({
  categories,
  onFiltersChange,
  onApply,
  onReset,
  onSave,
  onLoad,
  savedFilters = [],
  className,
  showSearch = true,
  showSaveLoad = true,
  showReset = true,
  showApply = true,
  isCollapsible = true,
  defaultExpanded = false
}: AdvancedFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [searchTerm, setSearchTerm] = useState('');
  const [localFilters, setLocalFilters] = useState<Record<string, unknown>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Memoize props to prevent unnecessary re-renders
  const memoizedCategories = useMemo(() => categories, [categories]);
  const memoizedSavedFilters = useMemo(() => savedFilters, [savedFilters]);

  // Filter értékek inicializálása
  useEffect(() => {
    const initialFilters: Record<string, unknown> = {};
    memoizedCategories.forEach(category => {
      category.filters.forEach(filter => {
        initialFilters[filter.id] = filter.value;
      });
    });
    setLocalFilters(initialFilters);
  }, [memoizedCategories]);

  // Filter változás kezelése
  const handleFilterChange = useCallback((filterId: string, value: unknown) => {
    const newFilters = { ...localFilters, [filterId]: value };
    setLocalFilters(newFilters);
    onFiltersChange?.(newFilters);
  }, [localFilters, onFiltersChange]);

  // Filter alkalmazása
  const handleApply = useCallback(() => {
    setIsLoading(true);
    onApply?.(localFilters);
    setTimeout(() => setIsLoading(false), 500);
  }, [localFilters, onApply]);

  // Filter reset
  const handleReset = useCallback(() => {
    const resetFilters: Record<string, unknown> = {};
    memoizedCategories.forEach(category => {
      category.filters.forEach(filter => {
        resetFilters[filter.id] = filter.value;
      });
    });
    setLocalFilters(resetFilters);
    onReset?.();
  }, [memoizedCategories, onReset]);

  // Kategória expand/collapse
  const toggleCategory = useCallback((categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  }, []);

  // Filter renderelése típus alapján
  const renderFilter = (filter: FilterOption) => {
    const value = localFilters[filter.id];

    switch (filter.type) {
      case 'text':
        return (
          <Input
            value={String(value || '')}
            onChange={(e) => handleFilterChange(filter.id, e.target.value)}
            placeholder={filter.label}
            className="h-9"
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            value={String(value || '')}
            onChange={(e) => handleFilterChange(filter.id, parseFloat(e.target.value) || 0)}
            placeholder={filter.label}
            className="h-9"
          />
        );

      case 'select':
        return (
          <Select value={value?.toString() || ''} onValueChange={(val: string) => handleFilterChange(filter.id, val)}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder={filter.label} />
            </SelectTrigger>
            <SelectContent>
              {filter.options?.map(option => (
                <SelectItem key={option.value} value={option.value.toString()}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'slider':
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>{filter.label}</span>
                          <span className="text-muted-foreground">
              {String(value || filter.min || 0)}{filter.unit}
            </span>
            </div>
            <Slider
              value={[Number(value || filter.min || 0)]}
              onValueChange={([val]: number[]) => handleFilterChange(filter.id, val)}
              min={filter.min || 0}
              max={filter.max || 100}
              step={filter.step || 1}
              className="w-full"
            />
          </div>
        );

      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={filter.id}
              checked={Boolean(value || false)}
              onCheckedChange={(checked: boolean) => handleFilterChange(filter.id, checked)}
            />
            <Label htmlFor={filter.id} className="text-sm font-normal">
              {filter.label}
            </Label>
          </div>
        );

      case 'switch':
        return (
          <div className="flex items-center justify-between">
            <Label className="text-sm font-normal">{filter.label}</Label>
            <Switch
              checked={Boolean(value || false)}
              onCheckedChange={(checked: boolean) => handleFilterChange(filter.id, checked)}
            />
          </div>
        );

      default:
        return null;
    }
  };

  // Szűrt kategóriák
  const filteredCategories = categories.filter(category =>
    !searchTerm || 
    category.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.filters.some(filter => 
      filter.label.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-semibold">Fejlett Szűrők</CardTitle>
            <Badge variant="secondary" className="text-xs">
              {Object.keys(localFilters).length} aktív
            </Badge>
          </div>
          
          {isCollapsible && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <X className="h-3 w-3" /> : <Filter className="h-3 w-3" />}
            </Button>
          )}
        </div>
        
        {isExpanded && (
          <CardDescription className="text-xs">
            Testreszabhatod a keresési feltételeket és szűrőket
          </CardDescription>
        )}
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          {/* Search */}
          {showSearch && (
            <div className="space-y-2">
              <Label className="text-xs font-medium">Keresés szűrők között</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Keresés szűrők között..."
                  className="pl-9 h-8 text-sm"
                />
              </div>
            </div>
          )}

          {/* Filter Categories */}
          <div className="space-y-3">
            {filteredCategories.map(category => (
              <div key={category.id} className="space-y-2">
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="flex items-center justify-between w-full p-2 rounded-md hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    {category.icon}
                    <span className="text-sm font-medium">{category.label}</span>
                    <Badge variant="outline" className="text-xs">
                      {category.filters.length}
                    </Badge>
                  </div>
                  <div className={cn(
                    "transition-transform duration-200",
                    expandedCategories.has(category.id) ? "rotate-180" : ""
                  )}>
                    <Filter className="h-3 w-3" />
                  </div>
                </button>

                {expandedCategories.has(category.id) && (
                  <div className="pl-4 space-y-3 border-l border-border">
                    {category.filters.map(filter => (
                      <div key={filter.id} className="space-y-2">
                        <Label className="text-xs font-medium text-muted-foreground">
                          {filter.label}
                        </Label>
                        {renderFilter(filter)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div className="flex items-center space-x-2">
              {showReset && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="h-8 px-3"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Reset
                </Button>
              )}

              {showSaveLoad && onSave && (
                <Select onValueChange={(name: string) => onLoad?.(name)}>
                  <SelectTrigger className="h-8 w-32">
                    <SelectValue placeholder="Mentett szűrők" />
                  </SelectTrigger>
                  <SelectContent>
                    {memoizedSavedFilters.map(saved => (
                      <SelectItem key={saved.name} value={saved.name}>
                        {saved.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {showApply && (
                <Button
                  size="sm"
                  onClick={handleApply}
                  disabled={isLoading}
                  className="h-8 px-4"
                >
                  {isLoading ? (
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  ) : (
                    <Zap className="h-3 w-3 mr-1" />
                  )}
                  Alkalmazás
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

// Quick Filters komponens
interface QuickFiltersProps {
  filters: { id: string; label: string; value: unknown; active?: boolean }[];
  onFilterToggle?: (filterId: string, value: unknown) => void;
  className?: string;
}

export function QuickFilters({ filters, onFilterToggle, className }: QuickFiltersProps) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {filters.map(filter => (
        <Badge
          key={filter.id}
          variant={filter.active ? "default" : "outline"}
          className={cn(
            "cursor-pointer transition-colors",
            filter.active && "bg-primary text-primary-foreground"
          )}
          onClick={() => onFilterToggle?.(filter.id, !filter.active)}
        >
          {filter.label}
        </Badge>
      ))}
    </div>
  );
}
