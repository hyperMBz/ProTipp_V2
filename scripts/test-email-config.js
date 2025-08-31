#!/usr/bin/env node

/**
 * Email Configuration Test for ProTipp V2
 * 
 * This script tests the email configuration by sending a test email.
 */

require('dotenv').config({ path: '.env.local' });

const nodemailer = require('nodemailer');

async function testEmailConfig() {
  console.log('📧 Testing email configuration...\n');

  const emailProvider = process.env.EMAIL_PROVIDER || 'gmail';
  const emailFrom = process.env.EMAIL_FROM || 'notifications@protipp.com';
  const testEmail = process.env.TEST_EMAIL || 'test@example.com';

  console.log(`Provider: ${emailProvider}`);
  console.log(`From: ${emailFrom}`);
  console.log(`Test To: ${testEmail}\n`);

  let transporter;

  try {
    switch (emailProvider) {
      case 'gmail':
        transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          }
        });
        break;

      case 'sendgrid':
        transporter = nodemailer.createTransport({
          host: 'smtp.sendgrid.net',
          port: 587,
          secure: false,
          auth: {
            user: 'apikey',
            pass: process.env.SENDGRID_API_KEY
          }
        });
        break;

      case 'aws-ses':
        transporter = nodemailer.createTransport({
          host: `email-smtp.${process.env.AWS_SES_REGION || 'us-east-1'}.amazonaws.com`,
          port: 587,
          secure: false,
          auth: {
            user: process.env.AWS_SES_ACCESS_KEY_ID,
            pass: process.env.AWS_SES_SECRET_ACCESS_KEY
          }
        });
        break;

      case 'resend':
        transporter = nodemailer.createTransport({
          host: 'smtp.resend.com',
          port: 587,
          secure: false,
          auth: {
            user: 'resend',
            pass: process.env.RESEND_API_KEY
          }
        });
        break;

      default:
        throw new Error(`Unsupported email provider: ${emailProvider}`);
    }

    // Verify connection
    console.log('🔍 Verifying connection...');
    await transporter.verify();
    console.log('✅ Connection verified successfully!\n');

    // Send test email
    console.log('📤 Sending test email...');
    const info = await transporter.sendMail({
      from: emailFrom,
      to: testEmail,
      subject: 'ProTipp V2 - Email Configuration Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6366f1;">🎉 Email Configuration Successful!</h2>
          <p>This is a test email from your ProTipp V2 notification system.</p>
          <p><strong>Provider:</strong> ${emailProvider}</p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          <hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #6b7280; font-size: 14px;">
            If you received this email, your email configuration is working correctly!
          </p>
        </div>
      `,
      text: `
        ProTipp V2 - Email Configuration Test
        
        This is a test email from your ProTipp V2 notification system.
        
        Provider: ${emailProvider}
        Timestamp: ${new Date().toISOString()}
        
        If you received this email, your email configuration is working correctly!
      `
    });

    console.log('✅ Test email sent successfully!');
    console.log(`📧 Message ID: ${info.messageId}`);
    console.log(`📬 Preview URL: ${nodemailer.getTestMessageUrl(info)}`);

  } catch (error) {
    console.error('❌ Email configuration test failed:');
    console.error(error.message);
    
    if (error.code) {
      console.error(`Error Code: ${error.code}`);
    }
    
    console.log('\n🔧 Troubleshooting tips:');
    console.log('1. Check your environment variables');
    console.log('2. Verify your credentials');
    console.log('3. Ensure your email provider is properly configured');
    console.log('4. Check firewall/network settings');
    
    process.exit(1);
  }
}

// Run the test
testEmailConfig().catch(console.error);
