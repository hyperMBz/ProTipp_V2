// Bookmakers API Endpoint
// Story 1.1 Task 6: Create API Endpoints

import { NextRequest, NextResponse } from 'next/server';
import { getBookmakerManager } from '@/lib/api/bookmakers/manager';
import { BookmakerIntegration } from '@/lib/api/bookmakers/base';

export async function GET(request: NextRequest) {
  try {
    // Check authentication (you can implement your own auth logic here)
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const apiType = searchParams.get('api_type');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get bookmaker manager instance
    const manager = getBookmakerManager();
    
    // Get all bookmaker statuses
    const bookmakers = await manager.getBookmakerStatus();

    // Apply filters
    let filteredBookmakers = bookmakers;

    if (status && status !== 'all') {
      filteredBookmakers = filteredBookmakers.filter(b => b.status === status);
    }

    if (apiType && apiType !== 'all') {
      filteredBookmakers = filteredBookmakers.filter(b => b.api_type === apiType);
    }

    // Apply pagination
    const paginatedBookmakers = filteredBookmakers.slice(offset, offset + limit);

    // Prepare response
    const response = {
      success: true,
      data: paginatedBookmakers,
      pagination: {
        total: filteredBookmakers.length,
        limit,
        offset,
        hasMore: offset + limit < filteredBookmakers.length
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('Bookmakers API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal Server Error', 
        message: 'Failed to retrieve bookmaker data',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { action, bookmaker_id, config } = body;

    const manager = getBookmakerManager();

    switch (action) {
      case 'refresh':
        // Refresh bookmaker status
        await manager.checkAllHealth();
        return NextResponse.json({
          success: true,
          message: 'Bookmaker status refreshed successfully',
          timestamp: new Date().toISOString()
        });

      case 'clear_cache':
        // Clear cache
        manager.clearCache();
        return NextResponse.json({
          success: true,
          message: 'Cache cleared successfully',
          timestamp: new Date().toISOString()
        });

      case 'get_cache_stats':
        // Get cache statistics
        const cacheStats = manager.getCacheStats();
        return NextResponse.json({
          success: true,
          data: cacheStats,
          timestamp: new Date().toISOString()
        });

      case 'get_bookmaker':
        // Get specific bookmaker
        if (!bookmaker_id) {
          return NextResponse.json(
            { error: 'Bad Request', message: 'bookmaker_id is required' },
            { status: 400 }
          );
        }

        const bookmaker = manager.getBookmaker(bookmaker_id);
        if (!bookmaker) {
          return NextResponse.json(
            { error: 'Not Found', message: 'Bookmaker not found' },
            { status: 404 }
          );
        }

        return NextResponse.json({
          success: true,
          data: bookmaker.getStatus(),
          timestamp: new Date().toISOString()
        });

      case 'update_config':
        // Update configuration (this would typically be stored in a database)
        if (!config) {
          return NextResponse.json(
            { error: 'Bad Request', message: 'config is required' },
            { status: 400 }
          );
        }

        // In a real implementation, you would save this to a database
        console.log('Updating configuration:', config);
        
        return NextResponse.json({
          success: true,
          message: 'Configuration updated successfully',
          timestamp: new Date().toISOString()
        });

      default:
        return NextResponse.json(
          { error: 'Bad Request', message: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Bookmakers API POST error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal Server Error', 
        message: 'Failed to process request',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function HEAD(request: NextRequest) {
  try {
    const manager = getBookmakerManager();
    const bookmakers = await manager.getBookmakerStatus();
    const activeCount = bookmakers.filter(b => b.status === 'active').length;
    
    return new NextResponse(null, {
      status: 200,
      headers: {
        'X-Bookmaker-Count': bookmakers.length.toString(),
        'X-Active-Count': activeCount.toString(),
        'X-Health-Check': 'OK'
      }
    });
  } catch (error) {
    return new NextResponse(null, {
      status: 503,
      headers: {
        'X-Health-Check': 'FAILED'
      }
    });
  }
}

// OpenAPI specification
export const openapi = {
  openapi: '3.0.0',
  info: {
    title: 'Bookmakers API',
    version: '1.0.0',
    description: 'API for managing bookmaker integrations'
  },
  paths: {
    '/api/v1/bookmakers': {
      get: {
        summary: 'Get bookmakers list',
        parameters: [
          {
            name: 'status',
            in: 'query',
            schema: { type: 'string', enum: ['all', 'active', 'inactive', 'error'] }
          },
          {
            name: 'api_type',
            in: 'query',
            schema: { type: 'string', enum: ['all', 'REST', 'GraphQL', 'WebSocket'] }
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', minimum: 1, maximum: 100 }
          },
          {
            name: 'offset',
            in: 'query',
            schema: { type: 'integer', minimum: 0 }
          }
        ],
        responses: {
          '200': {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/BookmakerIntegration'
                      }
                    },
                    pagination: {
                      type: 'object',
                      properties: {
                        total: { type: 'integer' },
                        limit: { type: 'integer' },
                        offset: { type: 'integer' },
                        hasMore: { type: 'boolean' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        summary: 'Perform bookmaker actions',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  action: {
                    type: 'string',
                    enum: ['refresh', 'clear_cache', 'get_cache_stats', 'get_bookmaker', 'update_config']
                  },
                  bookmaker_id: { type: 'string' },
                  config: { type: 'object' }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Successful response'
          }
        }
      }
    }
  },
  components: {
    schemas: {
      BookmakerIntegration: {
        type: 'object',
        properties: {
          bookmaker_id: { type: 'string' },
          name: { type: 'string' },
          api_type: { type: 'string', enum: ['REST', 'GraphQL', 'WebSocket'] },
          status: { type: 'string', enum: ['active', 'inactive', 'error'] },
          last_sync: { type: 'string', format: 'date-time' },
          error_count: { type: 'integer' },
          last_error: { type: 'string' }
        }
      }
    }
  }
};
