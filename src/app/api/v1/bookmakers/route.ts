// Bookmakers API Endpoint
// Story 1.1 Task 6: Create API Endpoints

import { NextRequest, NextResponse } from "next/server";
import { withUserAuth, apiError, apiSuccess, getQueryParams } from '@/lib/auth/api-middleware';

// GET /api/v1/bookmakers - Get bookmakers list (Protected)
export const GET = withUserAuth(async (request: NextRequest, user) => {
  try {
    const query = getQueryParams(request);
    const status = query.get("status");
    const sport = query.get("sport");

    // Mock bookmaker data
    const bookmakers = [
      {
        id: "unibet",
        name: "Unibet",
        status: "active",
        sports: ["futball", "tenisz", "kosárlabda"],
        last_update: new Date().toISOString(),
        odds_count: 1250
      },
      {
        id: "bwin",
        name: "Bwin",
        status: "active",
        sports: ["futball", "tenisz", "kosárlabda"],
        last_update: new Date().toISOString(),
        odds_count: 980
      },
      {
        id: "pinnacle",
        name: "Pinnacle",
        status: "active",
        sports: ["futball", "tenisz", "kosárlabda"],
        last_update: new Date().toISOString(),
        odds_count: 2100
      }
    ];

    // Filter by status if provided
    let filteredBookmakers = bookmakers;
    if (status) {
      filteredBookmakers = bookmakers.filter(b => b.status === status);
    }

    // Filter by sport if provided
    if (sport) {
      filteredBookmakers = filteredBookmakers.filter(b => 
        b.sports.includes(sport)
      );
    }

    return apiSuccess({
      bookmakers: filteredBookmakers,
      total: filteredBookmakers.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Bookmakers API error:", error);
    return apiError("Internal server error", 500, {
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// POST /api/v1/bookmakers - Bookmaker actions (Protected)
export const POST = withUserAuth(async (request: NextRequest, user) => {
  try {
    const body = await request.json();
    const { bookmaker_id, action } = body;

    if (!bookmaker_id || !action) {
      return apiError("Missing required fields: bookmaker_id, action", 400);
    }

    // Mock response for bookmaker action
    return apiSuccess({
      bookmaker_id,
      action,
      message: `Bookmaker ${action} successful`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Bookmakers POST error:", error);
    return apiError("Internal server error", 500, {
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// Health check endpoint
export async function HEAD(request: NextRequest) {
  try {
    // Mock health check
    return new NextResponse(null, {
      status: 200,
      headers: {
        'X-Bookmaker-Count': '3',
        'X-Active-Count': '3',
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
const openapiSpec = {
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
