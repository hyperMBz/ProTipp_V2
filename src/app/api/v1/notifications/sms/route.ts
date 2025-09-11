// SMS Notification API Route
// Story 1.6: Notification System Enhancement

import { NextRequest, NextResponse } from 'next/server';

// SMS service configuration
const SMS_CONFIG = {
  provider: process.env.SMS_PROVIDER || 'twilio',
  accountSid: process.env.TWILIO_ACCOUNT_SID,
  authToken: process.env.TWILIO_AUTH_TOKEN,
  fromNumber: process.env.TWILIO_FROM_NUMBER,
  apiKey: process.env.SMS_API_KEY,
  apiUrl: process.env.SMS_API_URL,
};

// SMS service interface
interface SMSService {
  sendSMS(to: string, message: string, options?: SMSOptions): Promise<boolean>;
}

interface SMSOptions {
  from?: string;
  mediaUrl?: string[];
  statusCallback?: string;
  maxPrice?: string;
  provideFeedback?: boolean;
}

// Twilio SMS service implementation
class TwilioSMSService implements SMSService {
  private accountSid: string;
  private authToken: string;
  private fromNumber: string;

  constructor() {
    this.accountSid = SMS_CONFIG.accountSid!;
    this.authToken = SMS_CONFIG.authToken!;
    this.fromNumber = SMS_CONFIG.fromNumber!;
  }

  async sendSMS(to: string, message: string, options?: SMSOptions): Promise<boolean> {
    try {
      const url = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`;
      
      const body = new URLSearchParams({
        To: to,
        From: this.fromNumber,
        Body: message,
        ...(options?.from && { From: options.from }),
        ...(options?.mediaUrl && { MediaUrl: options.mediaUrl.join(',') }),
        ...(options?.statusCallback && { StatusCallback: options.statusCallback }),
        ...(options?.maxPrice && { MaxPrice: options.maxPrice }),
        ...(options?.provideFeedback && { ProvideFeedback: options.provideFeedback.toString() }),
      });

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`${this.accountSid}:${this.authToken}`)}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Twilio SMS error:', errorData);
        return false;
      }

      const result = await response.json();
      console.log('SMS sent successfully:', result.sid);
      return true;
    } catch (error) {
      console.error('Error sending SMS via Twilio:', error);
      return false;
    }
  }
}

// Generic SMS service implementation (for other providers)
class GenericSMSService implements SMSService {
  private apiKey: string;
  private apiUrl: string;

  constructor() {
    this.apiKey = SMS_CONFIG.apiKey!;
    this.apiUrl = SMS_CONFIG.apiUrl!;
  }

  async sendSMS(to: string, message: string, options?: SMSOptions): Promise<boolean> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to,
          message,
          ...options,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Generic SMS error:', errorData);
        return false;
      }

      const result = await response.json();
      console.log('SMS sent successfully:', result);
      return true;
    } catch (error) {
      console.error('Error sending SMS via generic service:', error);
      return false;
    }
  }
}

// SMS service factory
function createSMSService(): SMSService {
  switch (SMS_CONFIG.provider) {
    case 'twilio':
      if (!SMS_CONFIG.accountSid || !SMS_CONFIG.authToken || !SMS_CONFIG.fromNumber) {
        throw new Error('Twilio configuration incomplete');
      }
      return new TwilioSMSService();
    
    case 'generic':
      if (!SMS_CONFIG.apiKey || !SMS_CONFIG.apiUrl) {
        throw new Error('Generic SMS configuration incomplete');
      }
      return new GenericSMSService();
    
    default:
      throw new Error(`Unsupported SMS provider: ${SMS_CONFIG.provider}`);
  }
}

// POST /api/v1/notifications/sms - Send SMS notification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, message, options } = body;

    if (!to || !message) {
      return NextResponse.json(
        { error: 'Recipient phone number and message are required' },
        { status: 400 }
      );
    }

    // Validate phone number format
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(to.replace(/\s/g, ''))) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    // Check message length (SMS limit is typically 160 characters)
    if (message.length > 160) {
      return NextResponse.json(
        { error: 'Message too long (max 160 characters)' },
        { status: 400 }
      );
    }

    // Create SMS service
    let smsService: SMSService;
    try {
      smsService = createSMSService();
    } catch (error) {
      console.error('SMS service creation failed:', error);
      return NextResponse.json(
        { error: 'SMS service not configured' },
        { status: 500 }
      );
    }

    // Send SMS
    const success = await smsService.sendSMS(to, message, options);

    if (success) {
      return NextResponse.json({
        success: true,
        message: 'SMS notification sent successfully',
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to send SMS notification' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error sending SMS notification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/v1/notifications/sms - Get SMS configuration
export async function GET() {
  try {
    return NextResponse.json({
      provider: SMS_CONFIG.provider,
      configured: !!(
        (SMS_CONFIG.provider === 'twilio' && SMS_CONFIG.accountSid && SMS_CONFIG.authToken && SMS_CONFIG.fromNumber) ||
        (SMS_CONFIG.provider === 'generic' && SMS_CONFIG.apiKey && SMS_CONFIG.apiUrl)
      ),
    });
  } catch (error) {
    console.error('Error getting SMS configuration:', error);
    return NextResponse.json(
      { error: 'Failed to get SMS configuration' },
      { status: 500 }
    );
  }
}
