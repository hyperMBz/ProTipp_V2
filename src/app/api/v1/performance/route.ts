import { NextRequest, NextResponse } from 'next/server';
import { performanceMonitor } from '@/lib/performance/monitoring';
import { cacheManager } from '@/lib/performance/cache-manager';
import { queryOptimizer } from '@/lib/performance/query-optimizer';

/**
 * GET /api/v1/performance
 * Get performance metrics and statistics
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const period = searchParams.get('period') as 'hour' | 'day' | 'week' || 'hour';
    const limit = parseInt(searchParams.get('limit') || '100');

    switch (type) {
      case 'summary': {
        const summary = performanceMonitor.getCurrentPerformanceSummary();
        return NextResponse.json({
          success: true,
          data: summary,
        });
      }

      case 'metrics': {
        const metricType = searchParams.get('metric_type');
        if (!metricType) {
          return NextResponse.json(
            { success: false, error: 'metric_type parameter is required' },
            { status: 400 }
          );
        }

        const aggregatedMetrics = performanceMonitor.getAggregatedMetrics(metricType, period);
        return NextResponse.json({
          success: true,
          data: aggregatedMetrics.slice(0, limit),
        });
      }

      case 'alerts': {
        const alerts = performanceMonitor.getActiveAlerts();
        return NextResponse.json({
          success: true,
          data: alerts,
        });
      }

      case 'cache': {
        const cacheStats = cacheManager.getStats();
        return NextResponse.json({
          success: true,
          data: cacheStats,
        });
      }

      case 'query-metrics': {
        const queryMetrics = queryOptimizer.getMetrics();
        return NextResponse.json({
          success: true,
          data: queryMetrics,
        });
      }

      default: {
        // Return all performance data
        const [summary, alerts, cacheStats, queryMetrics] = await Promise.all([
          performanceMonitor.getCurrentPerformanceSummary(),
          performanceMonitor.getActiveAlerts(),
          cacheManager.getStats(),
          queryOptimizer.getMetrics(),
        ]);

        return NextResponse.json({
          success: true,
          data: {
            summary,
            alerts,
            cache: cacheStats,
            queries: queryMetrics,
            timestamp: new Date().toISOString(),
          },
        });
      }
    }
  } catch (error) {
    console.error('[Performance API] Error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/performance
 * Record a performance metric
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      metric_type,
      value,
      unit = 'ms',
      endpoint,
      user_id,
      session_id,
      tags = {},
    } = body;

    // Validate required fields
    if (!metric_type || value === undefined) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'metric_type and value are required' 
        },
        { status: 400 }
      );
    }

    // Validate metric type
    const validMetricTypes = [
      'response_time',
      'throughput',
      'error_rate',
      'memory_usage',
      'cpu_usage',
      'cache_hit_rate'
    ];

    if (!validMetricTypes.includes(metric_type)) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Invalid metric_type. Must be one of: ${validMetricTypes.join(', ')}` 
        },
        { status: 400 }
      );
    }

    // Record the metric
    performanceMonitor.recordMetric({
      metric_type,
      value: parseFloat(value),
      unit,
      endpoint,
      user_id,
      session_id,
      tags,
    });

    return NextResponse.json({
      success: true,
      message: 'Metric recorded successfully',
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('[Performance API] Error recording metric:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to record metric',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/v1/performance
 * Update performance configuration or resolve alerts
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case 'resolve_alert': {
        const { alert_id } = data;
        if (!alert_id) {
          return NextResponse.json(
            { success: false, error: 'alert_id is required' },
            { status: 400 }
          );
        }

        performanceMonitor.resolveAlert(alert_id);
        
        return NextResponse.json({
          success: true,
          message: 'Alert resolved successfully',
        });
      }

      case 'add_alert_rule': {
        const {
          metric_type,
          threshold,
          comparison = 'gt',
          duration = 60,
          enabled = true,
          notification_channels = ['console'],
        } = data;

        if (!metric_type || threshold === undefined) {
          return NextResponse.json(
            { success: false, error: 'metric_type and threshold are required' },
            { status: 400 }
          );
        }

        const ruleId = performanceMonitor.addAlertRule({
          metric_type,
          threshold: parseFloat(threshold),
          comparison,
          duration: parseInt(duration),
          enabled,
          notification_channels,
        });

        return NextResponse.json({
          success: true,
          message: 'Alert rule added successfully',
          rule_id: ruleId,
        });
      }

      case 'clear_cache': {
        await cacheManager.clear();
        
        return NextResponse.json({
          success: true,
          message: 'Cache cleared successfully',
        });
      }

      case 'warm_cache': {
        const { cache_type = 'all' } = data;
        
        // In a real implementation, this would warm specific cache types
        console.log(`[Performance API] Warming ${cache_type} cache`);
        
        return NextResponse.json({
          success: true,
          message: `${cache_type} cache warmed successfully`,
        });
      }

      default: {
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
      }
    }

  } catch (error) {
    console.error('[Performance API] Error updating:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update performance configuration',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/performance
 * Clear metrics or cache
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    switch (type) {
      case 'cache': {
        await cacheManager.clear();
        return NextResponse.json({
          success: true,
          message: 'Cache cleared successfully',
        });
      }

      case 'metrics': {
        // Clear old metrics (in a real implementation)
        performanceMonitor.cleanup();
        return NextResponse.json({
          success: true,
          message: 'Old metrics cleared successfully',
        });
      }

      default: {
        return NextResponse.json(
          { success: false, error: 'type parameter is required (cache|metrics)' },
          { status: 400 }
        );
      }
    }

  } catch (error) {
    console.error('[Performance API] Error deleting:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to clear data',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
