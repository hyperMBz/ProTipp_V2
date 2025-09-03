
  value: number;
  unit: string;
  timestamp: Date;
  endpoint?: string;
  user_id?: string;
  session_id?: string;

}

export interface PerformanceAlert {
  id: string;

      timestamp: new Date(),
    };

    this.metrics.push(fullMetric);

   */
  resolveAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;

      timestamp: new Date(),
      resolved: false,
    };

    this.alerts.push(alert);

