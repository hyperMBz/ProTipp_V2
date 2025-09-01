/**
 * Load Balancer
 * Kérések elosztása és auto-scaling trigger-ek kezelése
 */

export interface LoadBalancerConfig {
  enabled: boolean;
  strategy: 'round-robin' | 'least-connections' | 'weighted' | 'ip-hash';
  healthCheck: {
    enabled: boolean;
    interval: number; // milliszekundumban
    timeout: number; // milliszekundumban
    path: string;
    expectedStatus: number[];
  };
  autoScaling: {
    enabled: boolean;
    minInstances: number;
    maxInstances: number;
    scaleUpThreshold: number; // CPU usage percentage
    scaleDownThreshold: number; // CPU usage percentage
    cooldownPeriod: number; // milliszekundumban
  };
  servers: ServerConfig[];
}

export interface ServerConfig {
  id: string;
  url: string;
  weight: number;
  maxConnections: number;
  healthCheckPath: string;
  enabled: boolean;
}

export interface ServerStatus {
  id: string;
  url: string;
  health: 'healthy' | 'unhealthy' | 'unknown';
  activeConnections: number;
  responseTime: number;
  lastHealthCheck: Date;
  errors: number;
  uptime: number;
}

export interface LoadBalancerStats {
  totalRequests: number;
  activeConnections: number;
  averageResponseTime: number;
  errorRate: number;
  serverCount: number;
  healthyServers: number;
  autoScalingEvents: number;
}

export class LoadBalancer {
  private static instance: LoadBalancer;
  private config: LoadBalancerConfig;
  private servers: Map<string, ServerStatus> = new Map();
  private currentIndex: number = 0;
  private stats: LoadBalancerStats;
  private healthCheckInterval?: NodeJS.Timeout;
  private lastScaleUp: number = 0;
  private lastScaleDown: number = 0;

  constructor(config: Partial<LoadBalancerConfig> = {}) {
    this.config = {
      enabled: true,
      strategy: 'round-robin',
      healthCheck: {
        enabled: true,
        interval: 30000, // 30 másodperc
        timeout: 5000, // 5 másodperc
        path: '/health',
        expectedStatus: [200, 204],
      },
      autoScaling: {
        enabled: false,
        minInstances: 1,
        maxInstances: 10,
        scaleUpThreshold: 80, // 80% CPU
        scaleDownThreshold: 20, // 20% CPU
        cooldownPeriod: 300000, // 5 perc
      },
      servers: [
        {
          id: 'primary',
          url: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
          weight: 1,
          maxConnections: 1000,
          healthCheckPath: '/health',
          enabled: true,
        },
      ],
      ...config,
    };

    this.stats = {
      totalRequests: 0,
      activeConnections: 0,
      averageResponseTime: 0,
      errorRate: 0,
      serverCount: this.config.servers.length,
      healthyServers: 0,
      autoScalingEvents: 0,
    };

    this.initializeServers();
    this.startHealthChecks();
  }

  static getInstance(config?: Partial<LoadBalancerConfig>): LoadBalancer {
    if (!LoadBalancer.instance) {
      LoadBalancer.instance = new LoadBalancer(config);
    }
    return LoadBalancer.instance;
  }

  /**
   * Kérés továbbítása load balancer-en keresztül
   */
  async routeRequest<T>(
    requestFn: (serverUrl: string) => Promise<T>,
    options?: {
      retries?: number;
      timeout?: number;
      fallback?: boolean;
    }
  ): Promise<T> {
    if (!this.config.enabled) {
      // Ha nincs load balancer, közvetlenül az első szerverhez
      const server = this.config.servers[0];
      return requestFn(server.url);
    }

    const retries = options?.retries || 3;
    const timeout = options?.timeout || 10000;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const server = this.selectServer();
        if (!server) {
          throw new Error('No healthy servers available');
        }

        const startTime = performance.now();
        const result = await this.executeWithTimeout(
          requestFn(server.url),
          timeout
        );
        const responseTime = performance.now() - startTime;

        this.updateServerStats(server.id, responseTime, true);
        this.stats.totalRequests++;
        this.updateAverageResponseTime(responseTime);

        return result;
      } catch (error) {
        lastError = error as Error;
        this.stats.errorRate = (this.stats.errorRate * this.stats.totalRequests + 1) / (this.stats.totalRequests + 1);
        
        if (attempt < retries - 1) {
          await this.delay(1000 * (attempt + 1)); // Exponential backoff
        }
      }
    }

    // Ha minden próbálkozás sikertelen és van fallback
    if (options?.fallback && this.config.servers.length > 1) {
      try {
        const fallbackServer = this.config.servers.find(s => s.id !== 'primary');
        if (fallbackServer) {
          return requestFn(fallbackServer.url);
        }
      } catch (error) {
        console.error('Fallback request failed:', error);
      }
    }

    throw lastError || new Error('All servers failed');
  }

  /**
   * Szerver kiválasztása a load balancing stratégia alapján
   */
  private selectServer(): ServerConfig | null {
    const healthyServers = this.config.servers.filter(server => {
      const status = this.servers.get(server.id);
      return server.enabled && status?.health === 'healthy';
    });

    if (healthyServers.length === 0) {
      return null;
    }

    switch (this.config.strategy) {
      case 'round-robin':
        return this.roundRobinSelection(healthyServers);
      
      case 'least-connections':
        return this.leastConnectionsSelection(healthyServers);
      
      case 'weighted':
        return this.weightedSelection(healthyServers);
      
      case 'ip-hash':
        return this.ipHashSelection(healthyServers);
      
      default:
        return healthyServers[0];
    }
  }

  /**
   * Round-robin szerver kiválasztás
   */
  private roundRobinSelection(servers: ServerConfig[]): ServerConfig {
    const server = servers[this.currentIndex % servers.length];
    this.currentIndex = (this.currentIndex + 1) % servers.length;
    return server;
  }

  /**
   * Least connections szerver kiválasztás
   */
  private leastConnectionsSelection(servers: ServerConfig[]): ServerConfig {
    return servers.reduce((min, server) => {
      const status = this.servers.get(server.id);
      const minStatus = this.servers.get(min.id);
      return (status?.activeConnections || 0) < (minStatus?.activeConnections || 0) ? server : min;
    });
  }

  /**
   * Weighted szerver kiválasztás
   */
  private weightedSelection(servers: ServerConfig[]): ServerConfig {
    const totalWeight = servers.reduce((sum, server) => sum + server.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const server of servers) {
      random -= server.weight;
      if (random <= 0) {
        return server;
      }
    }
    
    return servers[0];
  }

  /**
   * IP hash szerver kiválasztás
   */
  private ipHashSelection(servers: ServerConfig[]): ServerConfig {
    // Egyszerűsített IP hash (valós implementációban a kliens IP-jét használnánk)
    const hash = Math.abs(this.hashCode(Date.now().toString()));
    return servers[hash % servers.length];
  }

  /**
   * Health check indítása
   */
  private startHealthChecks(): void {
    if (!this.config.healthCheck.enabled) {
      return;
    }

    this.healthCheckInterval = setInterval(() => {
      this.performHealthChecks();
    }, this.config.healthCheck.interval);
  }

  /**
   * Health check végrehajtása
   */
  private async performHealthChecks(): Promise<void> {
    const promises = this.config.servers.map(server => this.checkServerHealth(server));
    await Promise.allSettled(promises);
    
    this.updateHealthyServerCount();
    this.checkAutoScaling();
  }

  /**
   * Egy szerver health check-je
   */
  private async checkServerHealth(server: ServerConfig): Promise<void> {
    if (!server.enabled) {
      return;
    }

    const status = this.servers.get(server.id) || this.createServerStatus(server);
    const startTime = performance.now();

    try {
      const response = await fetch(`${server.url}${server.healthCheckPath}`, {
        method: 'GET',
        signal: AbortSignal.timeout(this.config.healthCheck.timeout),
      });

      const responseTime = performance.now() - startTime;
      const isHealthy = this.config.healthCheck.expectedStatus.includes(response.status);

      status.health = isHealthy ? 'healthy' : 'unhealthy';
      status.responseTime = responseTime;
      status.lastHealthCheck = new Date();

      if (!isHealthy) {
        status.errors++;
      }

      this.servers.set(server.id, status);
    } catch (error) {
      status.health = 'unhealthy';
      status.errors++;
      status.lastHealthCheck = new Date();
      this.servers.set(server.id, status);
    }
  }

  /**
   * Auto-scaling ellenőrzés
   */
  private checkAutoScaling(): void {
    if (!this.config.autoScaling.enabled) {
      return;
    }

    const now = Date.now();
    const healthyCount = this.stats.healthyServers;
    const currentLoad = this.getCurrentLoad();

    // Scale up ellenőrzés
    if (currentLoad > this.config.autoScaling.scaleUpThreshold &&
        healthyCount < this.config.autoScaling.maxInstances &&
        now - this.lastScaleUp > this.config.autoScaling.cooldownPeriod) {
      
      this.scaleUp();
      this.lastScaleUp = now;
    }

    // Scale down ellenőrzés
    if (currentLoad < this.config.autoScaling.scaleDownThreshold &&
        healthyCount > this.config.autoScaling.minInstances &&
        now - this.lastScaleDown > this.config.autoScaling.cooldownPeriod) {
      
      this.scaleDown();
      this.lastScaleDown = now;
    }
  }

  /**
   * Scale up művelet
   */
  private scaleUp(): void {
    this.stats.autoScalingEvents++;
    console.log('Auto-scaling: Scaling up');
    // Itt lenne a tényleges scale up logika
    // Példa: új szerver példány indítása
  }

  /**
   * Scale down művelet
   */
  private scaleDown(): void {
    this.stats.autoScalingEvents++;
    console.log('Auto-scaling: Scaling down');
    // Itt lenne a tényleges scale down logika
    // Példa: szerver példány leállítása
  }

  /**
   * Szerver statisztikák frissítése
   */
  private updateServerStats(serverId: string, responseTime: number, success: boolean): void {
    const status = this.servers.get(serverId);
    if (status) {
      status.responseTime = responseTime;
      if (!success) {
        status.errors++;
      }
      this.servers.set(serverId, status);
    }
  }

  /**
   * Átlagos response time frissítése
   */
  private updateAverageResponseTime(responseTime: number): void {
    const totalTime = this.stats.averageResponseTime * (this.stats.totalRequests - 1) + responseTime;
    this.stats.averageResponseTime = totalTime / this.stats.totalRequests;
  }

  /**
   * Egészséges szerverek számának frissítése
   */
  private updateHealthyServerCount(): void {
    this.stats.healthyServers = Array.from(this.servers.values())
      .filter(status => status.health === 'healthy').length;
  }

  /**
   * Jelenlegi terhelés számítása
   */
  private getCurrentLoad(): number {
    // Egyszerűsített terhelés számítás
    // Valós implementációban CPU, memory, stb. metrikákat használnánk
    return (this.stats.activeConnections / this.stats.serverCount) * 100;
  }

  /**
   * Szerver státusz létrehozása
   */
  private createServerStatus(server: ServerConfig): ServerStatus {
    return {
      id: server.id,
      url: server.url,
      health: 'unknown',
      activeConnections: 0,
      responseTime: 0,
      lastHealthCheck: new Date(),
      errors: 0,
      uptime: 0,
    };
  }

  /**
   * Szerverek inicializálása
   */
  private initializeServers(): void {
    this.config.servers.forEach(server => {
      this.servers.set(server.id, this.createServerStatus(server));
    });
  }

  /**
   * Timeout wrapper
   */
  private async executeWithTimeout<T>(promise: Promise<T>, timeout: number): Promise<T> {
    return Promise.race([
      promise,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), timeout)
      ),
    ]);
  }

  /**
   * Késleltetés
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Hash code generálás
   */
  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
  }

  /**
   * Load balancer statisztikák
   */
  getStats(): LoadBalancerStats {
    return { ...this.stats };
  }

  /**
   * Szerver státuszok
   */
  getServerStatuses(): ServerStatus[] {
    return Array.from(this.servers.values());
  }

  /**
   * Load balancer leállítása
   */
  stop(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
  }
}

// Singleton export
export const loadBalancer = LoadBalancer.getInstance();
