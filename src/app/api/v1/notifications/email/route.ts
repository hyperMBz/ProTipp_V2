// Email Notification API Route
// Story 1.6: Notification System Enhancement

import { NextRequest, NextResponse } from 'next/server';
import * as nodemailer from 'nodemailer';

// Email template data types
interface ArbitrageAlertData {
  alert: {
    title: string;
    message: string;
    data: {
      profit: number;
      confidence: number;
      risk: number;
      sport: string;
      event: string;
      bookmakers: string[];
    };
  };
  timestamp: string;
  user: {
    name: string;
    email: string;
  };
}

interface PriceAlertData {
  alert: {
    title: string;
    message: string;
    data: {
      sport: string;
      event: string;
      bookmakers: string[];
    };
  };
  timestamp: string;
  user: {
    name: string;
    email: string;
  };
}

interface SystemAlertData {
  alert: {
    title: string;
    message: string;
  };
  timestamp: string;
  type: 'maintenance' | 'update' | 'security' | 'feature';
  scheduledTime?: string;
  user: {
    name: string;
    email: string;
  };
}

// Create email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Email templates
const emailTemplates = {
  'arbitrage-alert': {
    subject: '🚨 Arbitrage Opportunity Alert',
    html: (data: ArbitrageAlertData) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Arbitrage Opportunity Alert</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
          .alert-box { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 4px; padding: 15px; margin: 15px 0; }
          .profit { color: #28a745; font-weight: bold; font-size: 1.2em; }
          .details { background: white; padding: 15px; border-radius: 4px; margin: 15px 0; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 10px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 0.9em; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚨 Arbitrage Opportunity Alert</h1>
            <p>New profitable opportunity detected!</p>
          </div>
          <div class="content">
            <div class="alert-box">
              <h2>${data.alert.title}</h2>
              <p>${data.alert.message}</p>
            </div>
            <div class="details">
              <h3>Opportunity Details:</h3>
              <p><strong>Profit:</strong> <span class="profit">${data.alert.data.profit.toFixed(2)}%</span></p>
              <p><strong>Confidence:</strong> ${data.alert.data.confidence.toFixed(1)}%</p>
              <p><strong>Risk:</strong> ${data.alert.data.risk.toFixed(1)}%</p>
              <p><strong>Sport:</strong> ${data.alert.data.sport}</p>
              <p><strong>Event:</strong> ${data.alert.data.event}</p>
              <p><strong>Bookmakers:</strong> ${data.alert.data.bookmakers.join(', ')}</p>
            </div>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="button">View Details</a>
            <div class="footer">
              <p>This alert was sent at ${new Date(data.timestamp).toLocaleString()}</p>
              <p>ProTipp V2 - Professional Arbitrage Platform</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
  },
  'price-alert': {
    subject: '📈 Price Change Alert',
    html: (data: PriceAlertData) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Price Change Alert</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
          .alert-box { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 4px; padding: 15px; margin: 15px 0; }
          .details { background: white; padding: 15px; border-radius: 4px; margin: 15px 0; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 10px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 0.9em; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📈 Price Change Alert</h1>
            <p>Significant odds change detected!</p>
          </div>
          <div class="content">
            <div class="alert-box">
              <h2>${data.alert.title}</h2>
              <p>${data.alert.message}</p>
            </div>
            <div class="details">
              <h3>Change Details:</h3>
              <p><strong>Sport:</strong> ${data.alert.data.sport}</p>
              <p><strong>Event:</strong> ${data.alert.data.event}</p>
              <p><strong>Bookmaker:</strong> ${data.alert.data.bookmakers.join(', ')}</p>
            </div>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="button">View Details</a>
            <div class="footer">
              <p>This alert was sent at ${new Date(data.timestamp).toLocaleString()}</p>
              <p>ProTipp V2 - Professional Arbitrage Platform</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
  },
  'system-alert': {
    subject: 'ℹ️ System Alert',
    html: (data: SystemAlertData) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>System Alert</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
          .alert-box { background: #d1ecf1; border: 1px solid #bee5eb; border-radius: 4px; padding: 15px; margin: 15px 0; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 10px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 0.9em; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>ℹ️ System Alert</h1>
            <p>Important system notification</p>
          </div>
          <div class="content">
            <div class="alert-box">
              <h2>${data.alert.title}</h2>
              <p>${data.alert.message}</p>
            </div>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="button">View Dashboard</a>
            <div class="footer">
              <p>This alert was sent at ${new Date(data.timestamp).toLocaleString()}</p>
              <p>ProTipp V2 - Professional Arbitrage Platform</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
  },
};

// POST /api/v1/notifications/email - Send email notification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, subject, template, data, options } = body;

    if (!to || !template) {
      return NextResponse.json(
        { error: 'Recipient email and template are required' },
        { status: 400 }
      );
    }

    // Get template
    const emailTemplate = emailTemplates[template as keyof typeof emailTemplates];
    
    if (!emailTemplate) {
      return NextResponse.json(
        { error: 'Invalid email template' },
        { status: 400 }
      );
    }

    // Prepare email content
    const emailSubject = subject || emailTemplate.subject;
    const emailHtml = emailTemplate.html(data || {});

    // Send email
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject: emailSubject,
      html: emailHtml,
      priority: options?.priority || 'normal',
    };

    const result = await transporter.sendMail(mailOptions);

    if (result.messageId) {
      return NextResponse.json({
        success: true,
        message: 'Email notification sent successfully',
        messageId: result.messageId,
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to send email notification' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error sending email notification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/v1/notifications/email - Get email templates
export async function GET() {
  try {
    const templates = Object.keys(emailTemplates).map(key => ({
      name: key,
      subject: emailTemplates[key as keyof typeof emailTemplates].subject,
    }));

    return NextResponse.json({ templates });
  } catch (error) {
    console.error('Error getting email templates:', error);
    return NextResponse.json(
      { error: 'Failed to get email templates' },
      { status: 500 }
    );
  }
}
