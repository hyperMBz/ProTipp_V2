// Push Notification API Route
// Story 1.6: Notification System Enhancement

import { NextRequest, NextResponse } from 'next/server';
import * as webpush from 'web-push';

// Configure VAPID keys (only if keys are available)
const vapidEmail = process.env.VAPID_EMAIL || 'notifications@protipp.com';
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(
    `mailto:${vapidEmail}`,
    vapidPublicKey,
    vapidPrivateKey
  );
} else {
  console.warn('VAPID keys not configured. Push notifications will not work.');
}

// POST /api/v1/notifications/push - Send push notification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subscription, notification, options } = body;

    if (!subscription || !notification) {
      return NextResponse.json(
        { error: 'Subscription and notification are required' },
        { status: 400 }
      );
    }

    // Prepare push payload
    const payload = JSON.stringify({
      title: notification.title,
      body: notification.message,
      icon: notification.icon || '/icon-192x192.png',
      badge: notification.badge || '/badge-72x72.png',
      data: notification.data || {},
      requireInteraction: notification.requireInteraction || false,
      actions: notification.actions || [],
      timestamp: new Date().toISOString(),
    });

    // Send push notification
    const pushOptions = {
      TTL: options?.TTL || 3600, // 1 hour default
      urgency: options?.urgency || 'normal',
      topic: options?.topic,
    };

    const result = await webpush.sendNotification(
      subscription,
      payload,
      pushOptions
    );

    if (result.statusCode === 201) {
      return NextResponse.json({
        success: true,
        message: 'Push notification sent successfully',
        statusCode: result.statusCode,
      });
    } else {
      console.error('Push notification failed:', result);
      return NextResponse.json(
        { 
          error: 'Failed to send push notification',
          statusCode: result.statusCode,
          body: result.body,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error sending push notification:', error);
    
    // Handle specific web-push errors
    if (error instanceof Error) {
      if (error.message.includes('subscription has expired')) {
        return NextResponse.json(
          { error: 'Subscription has expired' },
          { status: 410 }
        );
      }
      
      if (error.message.includes('subscription is no longer valid')) {
        return NextResponse.json(
          { error: 'Subscription is no longer valid' },
          { status: 410 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/v1/notifications/push - Get VAPID public key
export async function GET() {
  try {
    return NextResponse.json({
      publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    });
  } catch (error) {
    console.error('Error getting VAPID public key:', error);
    return NextResponse.json(
      { error: 'Failed to get VAPID public key' },
      { status: 500 }
    );
  }
}
