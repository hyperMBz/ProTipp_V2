// Notification API Routes
// Story 1.6: Notification System Enhancement

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { withUserAuth, apiError, apiSuccess, getQueryParams } from '@/lib/auth/api-middleware';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/v1/notifications - Get user notifications (Protected)
export const GET = withUserAuth(async (request: NextRequest, user) => {
  try {
    const query = getQueryParams(request);
    const type = query.get('type');
    const limit = query.getInt('limit', 50) ?? 50;
    const offset = query.getInt('offset', 0) ?? 0;

    // Felhasználó csak saját notification-jeit láthatja
    let dbQuery = supabase
      .from('notification_history')
      .select('*')
      .eq('user_id', user.id)
      .order('sent_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (type) {
      dbQuery = dbQuery.eq('type', type);
    }

    const { data, error } = await dbQuery;

    if (error) {
      console.error('Error fetching notifications:', error);
      return apiError('Failed to fetch notifications', 500);
    }

    return apiSuccess({
      notifications: data || [],
      pagination: {
        total: data?.length || 0,
        limit,
        offset,
        hasMore: (data?.length || 0) === limit
      }
    });
  } catch (error) {
    console.error('Error in GET /api/v1/notifications:', error);
    return apiError('Internal server error', 500);
  }
});

// POST /api/v1/notifications - Create notification (Protected)
export const POST = withUserAuth(async (request: NextRequest, user) => {
  try {
    const body = await request.json();
    const { type, title, message, data } = body;

    if (!type || !title || !message) {
      return apiError('Missing required fields: type, title, message', 400);
    }

    // Felhasználó csak saját notification-t hozhat létre
    const { data: notification, error } = await supabase
      .from('notification_history')
      .insert({
        user_id: user.id, // Authenticated user ID használata
        type,
        title,
        message,
        data: data || {},
        channels_sent: [],
        sent_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating notification:', error);
      return apiError('Failed to create notification', 500);
    }

    return apiSuccess({ notification }, 201);
  } catch (error) {
    console.error('Error in POST /api/v1/notifications:', error);
    return apiError('Internal server error', 500);
  }
});

// PUT /api/v1/notifications - Update notification (Protected)
export const PUT = withUserAuth(async (request: NextRequest, user) => {
  try {
    const body = await request.json();
    const { notificationId, updates } = body;

    if (!notificationId) {
      return apiError('Notification ID is required', 400);
    }

    // Felhasználó csak saját notification-jeit frissítheti
    const { data, error } = await supabase
      .from('notification_history')
      .update(updates)
      .eq('id', notificationId)
      .eq('user_id', user.id) // Ownership ellenőrzés
      .select()
      .single();

    if (error) {
      console.error('Error updating notification:', error);
      return apiError('Failed to update notification', 500);
    }

    if (!data) {
      return apiError('Notification not found or access denied', 404);
    }

    return apiSuccess({ notification: data });
  } catch (error) {
    console.error('Error in PUT /api/v1/notifications:', error);
    return apiError('Internal server error', 500);
  }
});

// DELETE /api/v1/notifications - Delete notification (Protected)
export const DELETE = withUserAuth(async (request: NextRequest, user) => {
  try {
    const query = getQueryParams(request);
    const notificationId = query.get('id');

    if (!notificationId) {
      return apiError('Notification ID is required', 400);
    }

    // Felhasználó csak saját notification-jeit törölheti
    const { error, count } = await supabase
      .from('notification_history')
      .delete({ count: 'exact' })
      .eq('id', notificationId)
      .eq('user_id', user.id); // Ownership ellenőrzés

    if (error) {
      console.error('Error deleting notification:', error);
      return apiError('Failed to delete notification', 500);
    }

    if (count === 0) {
      return apiError('Notification not found or access denied', 404);
    }

    return apiSuccess({ deleted: true });
  } catch (error) {
    console.error('Error in DELETE /api/v1/notifications:', error);
    return apiError('Internal server error', 500);
  }
});
