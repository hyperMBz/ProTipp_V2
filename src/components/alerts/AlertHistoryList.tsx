"use client";

import { formatDistanceToNow } from 'date-fns';
import { hu } from 'date-fns/locale';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatNumber } from "@/lib/utils";
import {
  Bell,
  CheckCircle,
  Clock,
  DollarSign,
  Target,
  TrendingUp,
  AlertTriangle,
  Star,
  Zap
} from "lucide-react";
import { ArbitrageOpportunity } from "@/lib/mock-data";

interface LiveAlert {
  id: string;
  timestamp: Date;
  opportunity: ArbitrageOpportunity;
  type: 'high_profit' | 'large_stake' | 'favorite_sport' | 'closing_soon';
  triggered: boolean;
  acknowledged: boolean;
}

interface AlertHistoryListProps {
  alerts: LiveAlert[];
  onAcknowledge: (alertId: string) => void;
}

export function AlertHistoryList({ alerts, onAcknowledge }: AlertHistoryListProps) {

  const getAlertIcon = (type: LiveAlert['type']) => {
    switch (type) {
      case 'high_profit':
        return <TrendingUp className="h-4 w-4 text-green-400" />;
      case 'large_stake':
        return <DollarSign className="h-4 w-4 text-blue-400" />;
      case 'closing_soon':
        return <Clock className="h-4 w-4 text-orange-400" />;
      case 'favorite_sport':
        return <Star className="h-4 w-4 text-purple-400" />;
      default:
        return <Bell className="h-4 w-4 text-primary" />;
    }
  };

  const getAlertTypeLabel = (type: LiveAlert['type']) => {
    switch (type) {
      case 'high_profit':
        return 'Magas profit';
      case 'large_stake':
        return 'Nagy tét';
      case 'closing_soon':
        return 'Hamarosan lejár';
      case 'favorite_sport':
        return 'Kedvenc sport';
      default:
        return 'Alert';
    }
  };

  const getAlertBadgeColor = (type: LiveAlert['type']) => {
    switch (type) {
      case 'high_profit':
        return 'border-green-400 text-green-400';
      case 'large_stake':
        return 'border-blue-400 text-blue-400';
      case 'closing_soon':
        return 'border-orange-400 text-orange-400';
      case 'favorite_sport':
        return 'border-purple-400 text-purple-400';
      default:
        return 'border-primary text-primary';
    }
  };

  const getPriorityLevel = (alert: LiveAlert) => {
    const { opportunity, type } = alert;

    if (type === 'high_profit' && opportunity.profitMargin >= 10) return 'critical';
    if (type === 'closing_soon') return 'high';
    if (type === 'large_stake' && opportunity.totalStake >= 300000) return 'high';
    if (opportunity.profitMargin >= 5) return 'medium';
    return 'low';
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">KRITIKUS</Badge>;
      case 'high':
        return <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">MAGAS</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">KÖZEPES</Badge>;
      case 'low':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">ALACSONY</Badge>;
      default:
        return null;
    }
  };

  if (alerts.length === 0) {
    return (
      <Card className="gradient-bg border-primary/20">
        <CardContent className="p-8 text-center">
          <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground">Nincsenek aktív riasztások</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Az alerts rendszer aktív, de jelenleg nincsenek lehetőségek ami megfelelne a küszöbértékeidnek.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => {
        const { opportunity } = alert;
        const priority = getPriorityLevel(alert);
        const isUrgent = priority === 'critical' || priority === 'high';

        return (
          <Card
            key={alert.id}
            className={`
              transition-all duration-200 hover:scale-[1.01]
              ${alert.acknowledged
                ? 'border-border/50 bg-muted/20'
                : isUrgent
                  ? 'border-red-500/50 bg-red-50/5 shadow-lg shadow-red-500/10'
                  : 'border-primary/30 bg-primary/5'
              }
            `}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  {/* Icon and Status */}
                  <div className="flex flex-col items-center space-y-2">
                    {getAlertIcon(alert.type)}
                    {!alert.acknowledged && (
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    )}
                  </div>

                  {/* Alert Content */}
                  <div className="flex-1 space-y-2">
                    {/* Header */}
                    <div className="flex items-center space-x-2 flex-wrap">
                      <Badge variant="outline" className={getAlertBadgeColor(alert.type)}>
                        {getAlertTypeLabel(alert.type)}
                      </Badge>
                      {getPriorityBadge(priority)}
                      <Badge variant="outline" className="text-xs">
                        {opportunity.sport}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(alert.timestamp, { addSuffix: true, locale: hu })}
                      </span>
                    </div>

                    {/* Event Details */}
                    <div>
                      <h4 className="font-semibold text-sm">{opportunity.event}</h4>
                      <p className="text-xs text-muted-foreground">{opportunity.outcome}</p>
                    </div>

                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 py-2">
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-400">
                          {opportunity.profitMargin.toFixed(1)}%
                        </div>
                        <div className="text-xs text-muted-foreground">Profit margin</div>
                      </div>

                      <div className="text-center">
                        <div className="text-lg font-bold text-primary">
                          {formatNumber(opportunity.expectedProfit)} Ft
                        </div>
                        <div className="text-xs text-muted-foreground">Várható nyereség</div>
                      </div>

                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-400">
                          {formatNumber(opportunity.totalStake)} Ft
                        </div>
                        <div className="text-xs text-muted-foreground">Teljes tét</div>
                      </div>

                      <div className="text-center">
                        <div className="text-lg font-bold text-orange-400">
                          {opportunity.timeToExpiry}
                        </div>
                        <div className="text-xs text-muted-foreground">Lejárat</div>
                      </div>
                    </div>

                    {/* Betting Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-secondary/20 rounded-lg p-3">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="text-xs">
                            {opportunity.bet1.bookmaker}
                          </Badge>
                          <span className="font-mono text-sm font-semibold">
                            {opportunity.bet1.odds}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {opportunity.bet1.outcome}
                        </div>
                        <div className="text-xs text-primary">
                          Tét: {formatNumber(opportunity.stakes.bet1.stake)} Ft
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="text-xs">
                            {opportunity.bet2.bookmaker}
                          </Badge>
                          <span className="font-mono text-sm font-semibold">
                            {opportunity.bet2.odds}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {opportunity.bet2.outcome}
                        </div>
                        <div className="text-xs text-primary">
                          Tét: {formatNumber(opportunity.stakes.bet2.stake)} Ft
                        </div>
                      </div>
                    </div>

                    {/* Alert Specific Info */}
                    {alert.type === 'closing_soon' && (
                      <div className="flex items-center space-x-2 text-orange-400">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          Figyelem! Ez a lehetőség hamarosan lejár!
                        </span>
                      </div>
                    )}

                    {alert.type === 'high_profit' && opportunity.profitMargin >= 8 && (
                      <div className="flex items-center space-x-2 text-green-400">
                        <Zap className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          Kiváló profit lehetőség! ({opportunity.profitMargin.toFixed(1)}%)
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col space-y-2 ml-4">
                  {!alert.acknowledged ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onAcknowledge(alert.id)}
                      className="text-xs"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Láttam
                    </Button>
                  ) : (
                    <Badge variant="outline" className="text-xs border-green-400 text-green-400">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Tudomásul
                    </Badge>
                  )}

                  <Button
                    size="sm"
                    variant="default"
                    className="text-xs"
                    onClick={() => {
                      // Copy opportunity details to clipboard for easy betting
                      const details = `
Arbitrage: ${opportunity.event}
Profit: ${opportunity.profitMargin.toFixed(1)}%
${opportunity.bet1.bookmaker}: ${opportunity.bet1.outcome} @ ${opportunity.bet1.odds} (${formatNumber(opportunity.stakes.bet1.stake)} Ft)
${opportunity.bet2.bookmaker}: ${opportunity.bet2.outcome} @ ${opportunity.bet2.odds} (${formatNumber(opportunity.stakes.bet2.stake)} Ft)
                      `.trim();

                      navigator.clipboard.writeText(details);
                    }}
                  >
                    <Target className="h-3 w-3 mr-1" />
                    Fogadás
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
