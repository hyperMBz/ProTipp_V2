"use client";

// Bookmaker List Component
// Story 1.1 Task 5: Create Bookmaker UI Components

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  List,
  Search,
  Filter,
  RefreshCw,
  Plus,
  Trash2,
  Settings,
  Activity,
  CheckCircle,
  AlertCircle,
  Clock,
  Globe,
  Wifi,
  WifiOff,
  Zap,
  Database
} from "lucide-react";
import { useBookmakers, useBookmakerManager, useBookmakerFilter } from "@/lib/hooks/use-bookmakers";
import { BookmakerIntegration } from "@/lib/api/bookmakers/base";

interface FilterState {
  status: 'all' | 'active' | 'inactive' | 'error';
  apiType: 'all' | 'REST' | 'GraphQL' | 'WebSocket';
  searchTerm: string;
}

export default function BookmakerList() {
  const [filters, setFilters] = useState<FilterState>({
    status: 'all',
    apiType: 'all',
    searchTerm: ''
  });

  const { status, isLoading, error, refetch, checkHealth, isHealthChecking } = useBookmakers();
  const { manager, isInitialized, removeBookmaker } = useBookmakerManager();

  // Apply filters to bookmakers
  const filteredBookmakers = useBookmakerFilter(status, {
    status: filters.status === 'all' ? undefined : filters.status,
    apiType: filters.apiType === 'all' ? undefined : filters.apiType,
    searchTerm: filters.searchTerm || undefined
  });

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleRemoveBookmaker = async (bookmakerId: string) => {
    if (confirm(`Are you sure you want to remove ${bookmakerId}?`)) {
      await removeBookmaker(bookmakerId);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'inactive':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-500">Active</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getApiTypeIcon = (apiType: string) => {
    switch (apiType) {
      case 'REST':
        return <Globe className="h-4 w-4 text-blue-500" />;
      case 'WebSocket':
        return <Wifi className="h-4 w-4 text-green-500" />;
      case 'GraphQL':
        return <Zap className="h-4 w-4 text-purple-500" />;
      default:
        return <Database className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatLastSync = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
            Bookmaker List
          </h2>
          <p className="text-muted-foreground">
            Manage and monitor bookmaker API connections
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => refetch()}
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={() => checkHealth()}
            disabled={isHealthChecking}
            variant="outline"
            size="sm"
          >
            <Activity className={`h-4 w-4 ${isHealthChecking ? 'animate-spin' : ''}`} />
            Health Check
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search bookmakers..."
                  value={filters.searchTerm}
                  onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={filters.status}
                onValueChange={(value) => handleFilterChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* API Type Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">API Type</label>
              <Select
                value={filters.apiType}
                onValueChange={(value) => handleFilterChange('apiType', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="REST">REST</SelectItem>
                  <SelectItem value="WebSocket">WebSocket</SelectItem>
                  <SelectItem value="GraphQL">GraphQL</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Results Count */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Results</label>
              <div className="flex items-center justify-center h-10 px-3 bg-muted rounded-md">
                <span className="text-sm font-medium">
                  {filteredBookmakers.length} of {status.length}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bookmakers Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <List className="h-5 w-5" />
            Bookmakers ({filteredBookmakers.length})
          </CardTitle>
          <CardDescription>
            {isInitialized ? 'All configured bookmaker APIs' : 'Initializing bookmaker manager...'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-4 w-4" />
                <span className="font-medium">Error loading bookmakers</span>
              </div>
              <p className="text-sm text-red-500 mt-1">{error.message}</p>
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Loading bookmakers...</span>
            </div>
          ) : filteredBookmakers.length === 0 ? (
            <div className="text-center py-8">
              <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">No bookmakers found</h3>
              <p className="text-sm text-muted-foreground">
                {filters.searchTerm || filters.status !== 'all' || filters.apiType !== 'all'
                  ? 'Try adjusting your filters'
                  : 'No bookmakers are currently configured'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bookmaker</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>API Type</TableHead>
                  <TableHead>Last Sync</TableHead>
                  <TableHead>Error Count</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookmakers.map((bookmaker) => (
                  <TableRow key={bookmaker.bookmaker_id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {getStatusIcon(bookmaker.status)}
                        <div>
                          <div className="font-medium">{bookmaker.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {bookmaker.bookmaker_id}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(bookmaker.status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getApiTypeIcon(bookmaker.api_type)}
                        <span className="text-sm">{bookmaker.api_type}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {formatLastSync(bookmaker.last_sync)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {bookmaker.error_count > 0 ? (
                          <Badge variant="destructive" className="text-xs">
                            {bookmaker.error_count}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            0
                          </Badge>
                        )}
                        {bookmaker.last_error && (
                          <span className="text-xs text-muted-foreground truncate max-w-20" title={bookmaker.last_error}>
                            {bookmaker.last_error}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Navigate to config or open config modal
                            console.log('Configure', bookmaker.bookmaker_id);
                          }}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveBookmaker(bookmaker.bookmaker_id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
