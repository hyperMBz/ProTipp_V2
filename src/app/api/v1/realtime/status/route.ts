import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const connection_id = searchParams.get("connection_id");

    // Mock realtime status data
    const status = {
      connection_id: connection_id || "mock-connection-123",
      status: "connected",
      last_heartbeat: new Date().toISOString(),
      uptime: 3600, // seconds
      message_count: 1250,
      error_count: 0,
      latency_ms: 45,
      subscriptions: [
        {
          channel: "arbitrage_opportunities",
          status: "active",
          message_count: 850
        },
        {
          channel: "odds_updates",
          status: "active",
          message_count: 400
        }
      ],
      performance: {
        messages_per_second: 2.5,
        average_latency_ms: 45,
        error_rate: 0.0
      }
    };

    return NextResponse.json({
      success: true,
      data: status,
      timestamp: new Date().toISOString()
    }, { status: 200 });

  } catch (error) {
    console.error("Realtime status API error:", error);
    return NextResponse.json(
      { 
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, channel, connection_id } = body;

    if (!action) {
      return NextResponse.json(
        { error: "Missing required field: action" },
        { status: 400 }
      );
    }

    // Mock response for realtime actions
    const response = {
      success: true,
      action,
      connection_id: connection_id || "mock-connection-123",
      message: `Realtime ${action} successful`,
      timestamp: new Date().toISOString()
    };

    switch (action) {
      case "subscribe":
        response.message = `Subscribed to channel: ${channel}`;
        break;
      case "unsubscribe":
        response.message = `Unsubscribed from channel: ${channel}`;
        break;
      case "ping":
        response.message = "Pong";
        break;
      default:
        response.message = `Action ${action} completed`;
    }

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error("Realtime status POST error:", error);
    return NextResponse.json(
      { 
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
