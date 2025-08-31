"use client";

// Notification History Component
// Story 1.6: Notification System Enhancement

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
// ScrollArea not available, using div with overflow instead
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Smartphone, 
  Clock, 
  Eye, 
  EyeOff, 
  Trash2, 
  Filter,
  Search,
  Calendar,
  TrendingUp,
  AlertTriangle,
  Info
} from 'lucide-react';
import { useNotificationHistory } from '@/lib/hooks/use-notifications';

interface NotificationHistoryProps {
  userId: string;
}

interface NotificationItem {
  id: string;
  type: 'arbitrage_opportunity' | 'price_alert' | 'system_alert';
  title: string;
  message: string;
  data: any;
  channels_sent: string[];
  sent_at: string;
  read_at?: string;
  action_taken?: string;
}

export function NotificationHistoryComponent({ userId }: NotificationHistoryProps) {
  const { history, loading, error, markAsRead, clearHistory } = useNotificationHistory(userId);
  const [filteredHistory, setFilteredHistory] = useState<NotificationItem[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterRead, setFilterRead] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);

  // Filter and search notifications
  useEffect(() => {
    let filtered = [...history];

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(item => item.type === filterType);
    }

    // Filter by read status
    if (filterRead === 'unread') {
      filtered = filtered.filter(item => !item.read_at);
    } else if (filterRead === 'read') {
      filtered = filtered.filter(item => item.read_at);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(term) ||
        item.message.toLowerCase().includes(term) ||
        item.data?.sport?.toLowerCase().includes(term) ||
        item.data?.event?.toLowerCase().includes(term)
      );
    }

    setFilteredHistory(filtered);
  }, [history, filterType, filterRead, searchTerm]);

  // Handle marking notification as read
  const handleMarkAsRead = async (notificationId: string) => {
    await markAsRead(notificationId);
  };

  // Handle clearing history
  const handleClearHistory = async () => {
    if (confirm('Are you sure you want to clear all notification history? This action cannot be undone.')) {
      await clearHistory();
    }
  };

  // Get notification icon
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'arbitrage_opportunity':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'price_alert':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'system_alert':
        return <Info className="h-4 w-4 text-blue-600" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  // Get notification type label
  const getNotificationTypeLabel = (type: string) => {
    switch (type) {
      case 'arbitrage_opportunity':
        return 'Arbitrage Opportunity';
      case 'price_alert':
        return 'Price Alert';
      case 'system_alert':
        return 'System Alert';
      default:
        return 'Notification';
    }
  };

  // Get channel icons
  const getChannelIcons = (channels: string[]) => {
    return channels.map(channel => {
      switch (channel) {
        case 'push':
          return <Smartphone key={channel} className="h-3 w-3 text-blue-600" />;
        case 'email':
          return <Mail key={channel} className="h-3 w-3 text-green-600" />;
        case 'sms':
          return <MessageSquare key={channel} className="h-3 w-3 text-purple-600" />;
        default:
          return null;
      }
    });
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification History
          </CardTitle>
          <CardDescription>Loading notifications...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <Bell className="h-5 w-5" />
            Error Loading History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification History
          </CardTitle>
          <CardDescription>
            View and manage your notification history
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Type Filter */}
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="arbitrage_opportunity">Arbitrage Opportunities</SelectItem>
                <SelectItem value="price_alert">Price Alerts</SelectItem>
                <SelectItem value="system_alert">System Alerts</SelectItem>
              </SelectContent>
            </Select>

            {/* Read Status Filter */}
            <Select value={filterRead} onValueChange={setFilterRead}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
                <SelectItem value="read">Read</SelectItem>
              </SelectContent>
            </Select>

            {/* Clear History Button */}
            <Button
              variant="outline"
              onClick={handleClearHistory}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Clear History
            </Button>
          </div>

          {/* Notification Count */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              {filteredHistory.length} notification{filteredHistory.length !== 1 ? 's' : ''}
            </p>
            {filteredHistory.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const unreadNotifications = filteredHistory.filter(item => !item.read_at);
                  unreadNotifications.forEach(item => handleMarkAsRead(item.id));
                }}
                className="text-xs"
              >
                Mark all as read
              </Button>
            )}
          </div>

          {/* Notifications List */}
          <div className="h-96 overflow-y-auto">
            {filteredHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No notifications found</h3>
                <p className="text-sm text-muted-foreground">
                  {searchTerm || filterType !== 'all' || filterRead !== 'all'
                    ? 'Try adjusting your filters or search terms'
                    : 'You haven\'t received any notifications yet'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredHistory.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      notification.read_at
                        ? 'bg-muted/50 border-muted'
                        : 'bg-background border-border hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedNotification(notification)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {/* Notification Icon */}
                        <div className="mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>

                        {/* Notification Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-sm truncate">
                              {notification.title}
                            </h4>
                            {!notification.read_at && (
                              <Badge variant="secondary" className="text-xs">
                                New
                              </Badge>
                            )}
                          </div>

                          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                            {notification.message}
                          </p>

                          {/* Notification Details */}
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(notification.sent_at)}
                            </div>

                            {/* Channel Icons */}
                            {notification.channels_sent.length > 0 && (
                              <div className="flex items-center gap-1">
                                {getChannelIcons(notification.channels_sent)}
                              </div>
                            )}

                            {/* Type Badge */}
                            <Badge variant="outline" className="text-xs">
                              {getNotificationTypeLabel(notification.type)}
                            </Badge>
                          </div>

                          {/* Arbitrage Details */}
                          {notification.type === 'arbitrage_opportunity' && notification.data && (
                            <div className="mt-2 flex items-center gap-4 text-xs">
                              <span className="text-green-600 font-medium">
                                {notification.data.profit?.toFixed(2)}% profit
                              </span>
                              <span className="text-blue-600">
                                {notification.data.confidence?.toFixed(1)}% confidence
                              </span>
                              <span className="text-orange-600">
                                {notification.data.risk?.toFixed(1)}% risk
                              </span>
                              <span className="text-muted-foreground">
                                {notification.data.sport} - {notification.data.event}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 ml-4">
                        {!notification.read_at && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsRead(notification.id);
                            }}
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notification Detail Modal */}
      {selectedNotification && (
        <Card className="fixed inset-4 z-50 overflow-auto bg-background border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {getNotificationIcon(selectedNotification.type)}
                {selectedNotification.title}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedNotification(null)}
                className="h-8 w-8 p-0"
              >
                ×
              </Button>
            </div>
            <CardDescription>
              {formatDate(selectedNotification.sent_at)} • {getNotificationTypeLabel(selectedNotification.type)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Message</h4>
              <p className="text-sm text-muted-foreground">{selectedNotification.message}</p>
            </div>

            {selectedNotification.data && (
              <div>
                <h4 className="font-medium mb-2">Details</h4>
                <div className="bg-muted p-3 rounded-md">
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(selectedNotification.data, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">Channels:</span>
                {getChannelIcons(selectedNotification.channels_sent)}
              </div>
              {selectedNotification.action_taken && (
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">Action:</span>
                  <span>{selectedNotification.action_taken}</span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              {!selectedNotification.read_at && (
                <Button
                  onClick={() => {
                    handleMarkAsRead(selectedNotification.id);
                    setSelectedNotification(null);
                  }}
                  className="flex-1"
                >
                  Mark as Read
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => setSelectedNotification(null)}
                className="flex-1"
              >
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
