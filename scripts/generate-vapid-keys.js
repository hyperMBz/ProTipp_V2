#!/usr/bin/env node

/**
 * VAPID Keys Generator for ProTipp V2
 * 
 * This script generates VAPID keys for push notifications.
 * Run this script to generate the required keys for production.
 */

const webpush = require('web-push');

console.log('🔑 Generating VAPID keys for ProTipp V2...\n');

try {
  // Generate VAPID keys
  const vapidKeys = webpush.generateVAPIDKeys();
  
  console.log('✅ VAPID keys generated successfully!\n');
  console.log('📋 Add these to your environment variables:\n');
  console.log('NEXT_PUBLIC_VAPID_PUBLIC_KEY=' + vapidKeys.publicKey);
  console.log('VAPID_PRIVATE_KEY=' + vapidKeys.privateKey);
  console.log('VAPID_EMAIL=notifications@protipp.com\n');
  
  console.log('🔧 For production deployment:');
  console.log('1. Add these keys to your environment variables');
  console.log('2. Update VAPID_EMAIL with your actual email');
  console.log('3. Ensure your domain is configured for push notifications\n');
  
  console.log('📝 Example .env.local:');
  console.log('NEXT_PUBLIC_VAPID_PUBLIC_KEY=' + vapidKeys.publicKey);
  console.log('VAPID_PRIVATE_KEY=' + vapidKeys.privateKey);
  console.log('VAPID_EMAIL=notifications@protipp.com');
  
} catch (error) {
  console.error('❌ Error generating VAPID keys:', error.message);
  process.exit(1);
}
