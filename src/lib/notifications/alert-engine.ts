// Alert Engine - Alert generation and filtering
// Story 1.6: Notification System Enhancement

import { notificationManager, NotificationSettings } from './notification-manager';

export interface AlertCriteria {
  profit?: number;
  confidence?: number;
  risk?: number;
  sport?: string;
  league?: string;
  bookmaker?: string;
  event_type?: string;
  urgency?: 'low' | 'medium' | 'high' | 'critical';
}

export interface AlertOpportunity {
  id: string;
  title: string;
  message: string;
  type: 'arbitrage_opportunity' | 'price_alert' | 'system_alert';
  data: {
    profit: number;
    confidence: number;
    risk: number;
    sport: string;
    league: string;
    bookmakers: string[];
    event: string;
    odds: Record<string, number>;
    timestamp: Date;
  };
  priority: number;
  expires_at: Date;
}

export class AlertEngine {
  private notificationManager = notificationManager;

  /**
   * Generate alert from arbitrage opportunity
   */
  generateArbitrageAlert(opportunity: any): AlertOpportunity | null {
    try {
      const profit = opportunity.profit || 0;
      const confidence = opportunity.confidence || 0;
      const risk = opportunity.risk || 0;

      // Calculate priority based on profit and confidence
      const priority = this.calculatePriority(profit, confidence, risk);

      // Determine urgency
      const urgency = this.determineUrgency(profit, confidence, risk);

      // Generate title and message
      const title = this.generateAlertTitle(opportunity, urgency);
      const message = this.generateAlertMessage(opportunity, urgency);

      return {
        id: opportunity.id || `alert_${Date.now()}`,
        title,
        message,
        type: 'arbitrage_opportunity',
        data: {
          profit,
          confidence,
          risk,
          sport: opportunity.sport || 'Unknown',
          league: opportunity.league || 'Unknown',
          bookmakers: opportunity.bookmakers || [],
          event: opportunity.event || 'Unknown Event',
          odds: opportunity.odds || {},
          timestamp: new Date(),
        },
        priority,
        expires_at: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
      };
    } catch (error) {
      console.error('Error generating arbitrage alert:', error);
      return null;
    }
  }

  /**
   * Generate price alert
   */
  generatePriceAlert(priceChange: any): AlertOpportunity | null {
    try {
      const change = priceChange.change || 0;
      const urgency = Math.abs(change) > 10 ? 'high' : Math.abs(change) > 5 ? 'medium' : 'low';

      return {
        id: `price_${Date.now()}`,
        title: `Price Alert: ${priceChange.sport} - ${priceChange.event}`,
        message: `Odds changed by ${change > 0 ? '+' : ''}${change.toFixed(2)}% for ${priceChange.event}`,
        type: 'price_alert',
        data: {
          profit: 0,
          confidence: 0,
          risk: 0,
          sport: priceChange.sport || 'Unknown',
          league: priceChange.league || 'Unknown',
          bookmakers: [priceChange.bookmaker || 'Unknown'],
          event: priceChange.event || 'Unknown Event',
          odds: { [priceChange.bookmaker]: priceChange.new_odds },
          timestamp: new Date(),
        },
        priority: this.calculatePriority(0, 0, 0, urgency),
        expires_at: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      };
    } catch (error) {
      console.error('Error generating price alert:', error);
      return null;
    }
  }

  /**
   * Generate system alert
   */
  generateSystemAlert(alert: any): AlertOpportunity | null {
    try {
      return {
        id: `system_${Date.now()}`,
        title: alert.title || 'System Alert',
        message: alert.message || 'System notification',
        type: 'system_alert',
        data: {
          profit: 0,
          confidence: 0,
          risk: 0,
          sport: 'System',
          league: 'System',
          bookmakers: [],
          event: 'System Event',
          odds: {},
          timestamp: new Date(),
        },
        priority: alert.priority || 1,
        expires_at: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      };
    } catch (error) {
      console.error('Error generating system alert:', error);
      return null;
    }
  }

  /**
   * Filter alerts based on user settings
   */
  async filterAlertsForUser(
    userId: string,
    alerts: AlertOpportunity[]
  ): Promise<AlertOpportunity[]> {
    try {
      const settings = await this.notificationManager.getNotificationSettings(userId);
      
      if (!settings) {
        console.warn('No notification settings found for user:', userId);
        return [];
      }

      return alerts.filter(alert => {
        // Check if notification should be sent based on settings
        const shouldSend = this.notificationManager.shouldSendNotification(settings, {
          profit: alert.data.profit,
          confidence: alert.data.confidence,
          risk: alert.data.risk,
          sport: alert.data.sport,
          bookmaker: alert.data.bookmakers[0],
        });

        if (!shouldSend) {
          return false;
        }

        // Check if alert is expired
        if (alert.expires_at < new Date()) {
          return false;
        }

        // Check sport filter
        if (settings.sports.length > 0 && 
            !settings.sports.includes(alert.data.sport)) {
          return false;
        }

        // Check bookmaker filter
        if (settings.bookmakers.length > 0) {
          const hasMatchingBookmaker = alert.data.bookmakers.some(
            bookmaker => settings.bookmakers.includes(bookmaker)
          );
          if (!hasMatchingBookmaker) {
            return false;
          }
        }

        return true;
      });
    } catch (error) {
      console.error('Error filtering alerts for user:', error);
      return [];
    }
  }

  /**
   * Calculate alert priority (1-10, higher is more important)
   */
  private calculatePriority(
    profit: number,
    confidence: number,
    risk: number,
    urgency?: 'low' | 'medium' | 'high' | 'critical'
  ): number {
    let priority = 1;

    // Base priority on profit
    if (profit > 20) priority += 4;
    else if (profit > 10) priority += 3;
    else if (profit > 5) priority += 2;
    else if (profit > 2) priority += 1;

    // Adjust based on confidence
    if (confidence > 90) priority += 2;
    else if (confidence > 75) priority += 1;

    // Adjust based on risk
    if (risk < 5) priority += 2;
    else if (risk < 10) priority += 1;

    // Adjust based on urgency
    switch (urgency) {
      case 'critical':
        priority += 3;
        break;
      case 'high':
        priority += 2;
        break;
      case 'medium':
        priority += 1;
        break;
    }

    return Math.min(priority, 10);
  }

  /**
   * Determine alert urgency
   */
  private determineUrgency(
    profit: number,
    confidence: number,
    risk: number
  ): 'low' | 'medium' | 'high' | 'critical' {
    if (profit > 15 && confidence > 85 && risk < 5) return 'critical';
    if (profit > 10 && confidence > 75) return 'high';
    if (profit > 5 && confidence > 60) return 'medium';
    return 'low';
  }

  /**
   * Generate alert title
   */
  private generateAlertTitle(opportunity: any, urgency: string): string {
    const profit = opportunity.profit || 0;
    const sport = opportunity.sport || 'Unknown Sport';
    const event = opportunity.event || 'Unknown Event';

    const urgencyEmoji = {
      critical: '🚨',
      high: '⚡',
      medium: '📈',
      low: '💡',
    }[urgency] || '💡';

    return `${urgencyEmoji} ${profit.toFixed(2)}% Profit - ${sport}: ${event}`;
  }

  /**
   * Generate alert message
   */
  private generateAlertMessage(opportunity: any, urgency: string): string {
    const profit = opportunity.profit || 0;
    const confidence = opportunity.confidence || 0;
    const risk = opportunity.risk || 0;
    const sport = opportunity.sport || 'Unknown Sport';
    const event = opportunity.event || 'Unknown Event';
    const bookmakers = opportunity.bookmakers || [];

    return `Arbitrage opportunity detected! ${profit.toFixed(2)}% profit with ${confidence.toFixed(1)}% confidence and ${risk.toFixed(1)}% risk. ${sport}: ${event} across ${bookmakers.join(', ')}.`;
  }

  /**
   * Process arbitrage opportunities and generate alerts
   */
  async processArbitrageOpportunities(
    opportunities: any[],
    userId: string
  ): Promise<AlertOpportunity[]> {
    try {
      // Generate alerts from opportunities
      const alerts = opportunities
        .map(opp => this.generateArbitrageAlert(opp))
        .filter(alert => alert !== null) as AlertOpportunity[];

      // Filter alerts for user
      const filteredAlerts = await this.filterAlertsForUser(userId, alerts);

      // Sort by priority (highest first)
      return filteredAlerts.sort((a, b) => b.priority - a.priority);
    } catch (error) {
      console.error('Error processing arbitrage opportunities:', error);
      return [];
    }
  }

  /**
   * Process price changes and generate alerts
   */
  async processPriceChanges(
    priceChanges: any[],
    userId: string
  ): Promise<AlertOpportunity[]> {
    try {
      // Generate alerts from price changes
      const alerts = priceChanges
        .map(change => this.generatePriceAlert(change))
        .filter(alert => alert !== null) as AlertOpportunity[];

      // Filter alerts for user
      const filteredAlerts = await this.filterAlertsForUser(userId, alerts);

      // Sort by priority (highest first)
      return filteredAlerts.sort((a, b) => b.priority - a.priority);
    } catch (error) {
      console.error('Error processing price changes:', error);
      return [];
    }
  }
}

// Singleton instance
export const alertEngine = new AlertEngine();
