"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LayoutDashboard, 
  Settings, 
  Maximize2, 
  Minimize2, 
  RefreshCw,
  Grid3X3,
  List,
  Filter,
  Search,
  Bell,
  TrendingUp,
  DollarSign,
  Activity,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

// Responsive Grid Layout wrapper
const ResponsiveGridLayout = WidthProvider(Responsive);

// Widget típusok
export interface DashboardWidget {
  id: string;
  title: string;
  description?: string;
  component: React.ReactNode;
  minW?: number;
  minH?: number;
  w?: number;
  h?: number;
  x?: number;
  y?: number;
  static?: boolean;
  isResizable?: boolean;
  isDraggable?: boolean;
}

interface LayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  static?: boolean;
  isResizable?: boolean;
  isDraggable?: boolean;
}

// Dashboard layout props
interface DashboardLayoutProps {
  widgets: DashboardWidget[];
  onLayoutChange?: (layout: LayoutItem[]) => void;
  onWidgetResize?: (widgetId: string, size: { w: number; h: number }) => void;
  onWidgetMove?: (widgetId: string, position: { x: number; y: number }) => void;
  className?: string;
  showGrid?: boolean;
  showControls?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function DashboardLayout({
  widgets,
  onLayoutChange,
  onWidgetResize,
  onWidgetMove,
  className,
  showGrid = false,
  showControls = true,
  autoRefresh = true,
  refreshInterval = 30000
}: DashboardLayoutProps) {
  const [layout, setLayout] = useState<LayoutItem[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Memoize props to prevent unnecessary re-renders
  const memoizedWidgets = useMemo(() => widgets, [widgets]);
  const memoizedAutoRefresh = useMemo(() => autoRefresh, [autoRefresh]);
  const memoizedRefreshInterval = useMemo(() => refreshInterval, [refreshInterval]);

  // Layout inicializálása
  useEffect(() => {
    const initialLayout = memoizedWidgets.map((widget, index) => ({
      i: widget.id,
      x: widget.x ?? (index % 2) * 6,
      y: widget.y ?? Math.floor(index / 2) * 4,
      w: widget.w ?? 6,
      h: widget.h ?? 4,
      minW: widget.minW ?? 3,
      minH: widget.minH ?? 2,
      static: widget.static ?? false,
      isResizable: widget.isResizable ?? true,
      isDraggable: widget.isDraggable ?? true,
    }));
    setLayout(initialLayout);
  }, [memoizedWidgets]);

  // Refresh kezelése
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    // Itt lehetne API hívás vagy adat frissítés
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  }, []);

  // Auto refresh kezelése
  useEffect(() => {
    if (!memoizedAutoRefresh) return;

    const interval = setInterval(() => {
      handleRefresh();
    }, memoizedRefreshInterval);

    return () => clearInterval(interval);
  }, [memoizedAutoRefresh, memoizedRefreshInterval, handleRefresh]);

  // Layout változás kezelése
  const handleLayoutChange = useCallback((newLayout: LayoutItem[]) => {
    setLayout(newLayout);
    onLayoutChange?.(newLayout);
  }, [onLayoutChange]);

  // Widget resize kezelése
  const handleResize = useCallback((layout: LayoutItem[], oldItem: LayoutItem, newItem: LayoutItem) => {
    onWidgetResize?.(newItem.i, { w: newItem.w, h: newItem.h });
  }, [onWidgetResize]);

  // Widget move kezelése
  const handleMove = useCallback((layout: LayoutItem[], oldItem: LayoutItem, newItem: LayoutItem) => {
    onWidgetMove?.(newItem.i, { x: newItem.x, y: newItem.y });
  }, [onWidgetMove]);

  // Widget renderelése
  const renderWidget = (widget: DashboardWidget) => {
    return (
      <Card 
        key={widget.id} 
        className={cn(
          "h-full transition-all duration-200 hover:shadow-lg",
          "border-primary/20 bg-gradient-to-br from-background to-background/50",
          "backdrop-blur-sm"
        )}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CardTitle className="text-sm font-semibold text-primary">
                {widget.title}
              </CardTitle>
              {widget.description && (
                <Badge variant="secondary" className="text-xs">
                  {widget.description}
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => handleRefresh()}
                disabled={isRefreshing}
              >
                <RefreshCw className={cn("h-3 w-3", isRefreshing && "animate-spin")} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-full">
            {widget.component}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Grid layout renderelése
  const renderGridLayout = () => (
    <ResponsiveGridLayout
      className={cn("min-h-screen", className)}
      layouts={{
        lg: layout,
        md: layout.map((item: LayoutItem) => ({ ...item, w: Math.min(item.w, 12) })),
        sm: layout.map((item: LayoutItem) => ({ ...item, w: 12, h: Math.max(item.h, 3) })),
        xs: layout.map((item: LayoutItem) => ({ ...item, w: 12, h: Math.max(item.h, 4) }))
      }}
      breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480 }}
      cols={{ lg: 12, md: 12, sm: 12, xs: 12 }}
      rowHeight={80}
      onLayoutChange={handleLayoutChange}
      onResize={handleResize}
      // onMove={handleMove}
      isDraggable={true}
      isResizable={true}
      useCSSTransforms={true}
      compactType="vertical"
      preventCollision={false}
      margin={[16, 16]}
      containerPadding={[16, 16]}
    >
      {memoizedWidgets.map(widget => (
        <div key={widget.id} className="h-full">
          {renderWidget(widget)}
        </div>
      ))}
    </ResponsiveGridLayout>
  );

  // List layout renderelése
  const renderListLayout = () => (
    <div className="space-y-4 p-4">
      {memoizedWidgets.map(widget => (
        <div key={widget.id} className="w-full">
          {renderWidget(widget)}
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Dashboard Header */}
      {showControls && (
        <div className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <LayoutDashboard className="h-5 w-5 text-primary" />
                  <h1 className="text-lg font-semibold">ProTipp Dashboard</h1>
                </div>
                <Badge variant="outline" className="text-xs">
                  <Zap className="h-3 w-3 mr-1" />
                  Real-time
                </Badge>
              </div>

              <div className="flex items-center space-x-2">
                {/* View Mode Toggle */}
                <div className="flex items-center space-x-1 border border-border rounded-md p-1">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>

                {/* Search */}
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-3"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Search className="h-4 w-4 mr-2" />
                  Keresés
                </Button>

                {/* Filters */}
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-3"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Szűrők
                </Button>

                {/* Notifications */}
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0 relative"
                >
                  <Bell className="h-4 w-4" />
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs">
                    3
                  </Badge>
                </Button>

                {/* Settings */}
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Search and Filters Panel */}
            {showFilters && (
              <div className="mt-3 p-3 border border-border rounded-lg bg-card/50">
                <div className="flex items-center space-x-4">
                  <input
                    type="text"
                    placeholder="Keresés widget-ek között..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 px-3 py-2 border border-border rounded-md bg-background text-sm"
                  />
                  <Button variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Frissítés
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Dashboard Content */}
      <div className="flex-1">
        {viewMode === 'grid' ? renderGridLayout() : renderListLayout()}
      </div>
    </div>
  );
}
