"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

interface TouchOptimizedTableProps<T> {
  data: T[];
  columns: {
    key: keyof T;
    header: string;
    render?: (value: T[keyof T], row: T) => React.ReactNode;
    width?: string;
    sortable?: boolean;
  }[];
  className?: string;
  onRowClick?: (row: T) => void;
  onSort?: (key: keyof T, direction: 'asc' | 'desc') => void;
  sortKey?: keyof T;
  sortDirection?: 'asc' | 'desc';
  maxHeight?: string;
  showPagination?: boolean;
  itemsPerPage?: number;
}

export function TouchOptimizedTable<T extends Record<string, any>>({
  data,
  columns,
  className,
  onRowClick,
  onSort,
  sortKey,
  sortDirection,
  maxHeight = "400px",
  showPagination = true,
  itemsPerPage = 10,
}: TouchOptimizedTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  // Touch gesztus kezelés
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    } else if (isRightSwipe && currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  // Pagination
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = data.slice(startIndex, endIndex);

  // Row selection
  const handleRowClick = (row: T, index: number) => {
    setSelectedRow(index);
    onRowClick?.(row);
  };

  // Sort handling
  const handleSort = (key: keyof T) => {
    if (!onSort) return;
    const newDirection = sortKey === key && sortDirection === 'asc' ? 'desc' : 'asc';
    onSort(key, newDirection);
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      {/* Table Container */}
      <div
        ref={tableRef}
        className="relative"
        style={{ maxHeight }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Swipe Indicators */}
        <div className="absolute top-1/2 left-2 transform -translate-y-1/2 z-10">
          {currentPage > 1 && (
            <div className="bg-primary/20 rounded-full p-1">
              <ChevronLeft className="h-4 w-4 text-primary" />
            </div>
          )}
        </div>
        <div className="absolute top-1/2 right-2 transform -translate-y-1/2 z-10">
          {currentPage < totalPages && (
            <div className="bg-primary/20 rounded-full p-1">
              <ChevronRight className="h-4 w-4 text-primary" />
            </div>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            {/* Header */}
            <thead className="bg-muted/50 sticky top-0 z-20">
              <tr>
                {columns.map((column) => (
                  <th
                    key={String(column.key)}
                    className={cn(
                      "px-4 py-3 text-left text-sm font-medium text-muted-foreground",
                      column.sortable && "cursor-pointer hover:bg-muted/70",
                      column.width && `w-${column.width}`
                    )}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{column.header}</span>
                      {column.sortable && sortKey === column.key && (
                        <span className="text-primary">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
                <th className="w-12 px-2 py-3"></th>
              </tr>
            </thead>

            {/* Body */}
            <tbody className="divide-y divide-border">
              {currentData.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={cn(
                    "hover:bg-muted/50 transition-colors cursor-pointer",
                    selectedRow === rowIndex && "bg-primary/10",
                    onRowClick && "active:bg-primary/20"
                  )}
                  onClick={() => handleRowClick(row, rowIndex)}
                >
                  {columns.map((column) => (
                    <td
                      key={String(column.key)}
                      className="px-4 py-3 text-sm"
                    >
                      {column.render
                        ? column.render(row[column.key], row)
                        : String(row[column.key] || '')}
                    </td>
                  ))}
                  <td className="px-2 py-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        // További műveletek menü
                      }}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {currentData.length === 0 && (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <div className="text-center">
              <div className="text-lg font-medium">Nincs adat</div>
              <div className="text-sm">Nincs megjeleníthető adat</div>
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {showPagination && totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <div className="text-sm text-muted-foreground">
            {startIndex + 1}-{Math.min(endIndex, data.length)} / {data.length}
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                );
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
