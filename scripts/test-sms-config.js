#!/usr/bin/env node

/**
 * SMS Configuration Test for ProTipp V2
 * 
 * This script tests the SMS configuration by sending a test SMS.
 */

require('dotenv').config({ path: '.env.local' });

async function testSMSConfig() {
  console.log('📱 Testing SMS configuration...\n');

  const smsProvider = process.env.SMS_PROVIDER || 'twilio';
  const testPhone = process.env.TEST_PHONE || '+1234567890';

  console.log(`Provider: ${smsProvider}`);
  console.log(`Test To: ${testPhone}\n`);

  try {
    switch (smsProvider) {
      case 'twilio':
        await testTwilio(testPhone);
        break;

      case 'vonage':
        await testVonage(testPhone);
        break;

      case 'aws-sns':
        await testAWSSNS(testPhone);
        break;

      case 'messagebird':
        await testMessageBird(testPhone);
        break;

      default:
        throw new Error(`Unsupported SMS provider: ${smsProvider}`);
    }

  } catch (error) {
    console.error('❌ SMS configuration test failed:');
    console.error(error.message);
    
    if (error.code) {
      console.error(`Error Code: ${error.code}`);
    }
    
    console.log('\n🔧 Troubleshooting tips:');
    console.log('1. Check your environment variables');
    console.log('2. Verify your API credentials');
    console.log('3. Ensure your phone number is verified');
    console.log('4. Check your account balance');
    console.log('5. Verify geographic restrictions');
    
    process.exit(1);
  }
}

async function testTwilio(testPhone) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    throw new Error('Missing Twilio credentials. Please check TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER');
  }

  console.log('🔍 Testing Twilio configuration...');
  
  const client = require('twilio')(accountSid, authToken);
  
  const message = await client.messages.create({
    body: `🎉 ProTipp V2 SMS Test - Configuration successful! Timestamp: ${new Date().toISOString()}`,
    from: fromNumber,
    to: testPhone
  });

  console.log('✅ Test SMS sent successfully!');
  console.log(`📱 Message SID: ${message.sid}`);
  console.log(`📊 Status: ${message.status}`);
}

async function testVonage(testPhone) {
  const apiKey = process.env.VONAGE_API_KEY;
  const apiSecret = process.env.VONAGE_API_SECRET;
  const fromNumber = process.env.VONAGE_PHONE_NUMBER;

  if (!apiKey || !apiSecret || !fromNumber) {
    throw new Error('Missing Vonage credentials. Please check VONAGE_API_KEY, VONAGE_API_SECRET, and VONAGE_PHONE_NUMBER');
  }

  console.log('🔍 Testing Vonage configuration...');
  
  const Vonage = require('@vonage/server-sdk');
  const vonage = new Vonage({
    apiKey: apiKey,
    apiSecret: apiSecret
  });

  return new Promise((resolve, reject) => {
    vonage.message.sendSms(fromNumber, testPhone, 
      `🎉 ProTipp V2 SMS Test - Configuration successful! Timestamp: ${new Date().toISOString()}`,
      (err, responseData) => {
        if (err) {
          reject(err);
        } else {
          console.log('✅ Test SMS sent successfully!');
          console.log(`📱 Message ID: ${responseData.messages[0]['message-id']}`);
          console.log(`📊 Status: ${responseData.messages[0].status}`);
          resolve(responseData);
        }
      }
    );
  });
}

async function testAWSSNS(testPhone) {
  const accessKeyId = process.env.AWS_SNS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SNS_SECRET_ACCESS_KEY;
  const region = process.env.AWS_SNS_REGION || 'us-east-1';
  const fromNumber = process.env.AWS_SNS_PHONE_NUMBER;

  if (!accessKeyId || !secretAccessKey || !fromNumber) {
    throw new Error('Missing AWS SNS credentials. Please check AWS_SNS_ACCESS_KEY_ID, AWS_SNS_SECRET_ACCESS_KEY, and AWS_SNS_PHONE_NUMBER');
  }

  console.log('🔍 Testing AWS SNS configuration...');
  
  const AWS = require('aws-sdk');
  AWS.config.update({
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
    region: region
  });

  const sns = new AWS.SNS();
  
  const params = {
    Message: `🎉 ProTipp V2 SMS Test - Configuration successful! Timestamp: ${new Date().toISOString()}`,
    PhoneNumber: testPhone
  };

  const result = await sns.publish(params).promise();
  
  console.log('✅ Test SMS sent successfully!');
  console.log(`📱 Message ID: ${result.MessageId}`);
}

async function testMessageBird(testPhone) {
  const apiKey = process.env.MESSAGEBIRD_API_KEY;
  const fromNumber = process.env.MESSAGEBIRD_PHONE_NUMBER;

  if (!apiKey || !fromNumber) {
    throw new Error('Missing MessageBird credentials. Please check MESSAGEBIRD_API_KEY and MESSAGEBIRD_PHONE_NUMBER');
  }

  console.log('🔍 Testing MessageBird configuration...');
  
  const messagebird = require('messagebird')(apiKey);
  
  return new Promise((resolve, reject) => {
    messagebird.messages.create({
      originator: fromNumber,
      recipients: [testPhone],
      body: `🎉 ProTipp V2 SMS Test - Configuration successful! Timestamp: ${new Date().toISOString()}`
    }, (err, response) => {
      if (err) {
        reject(err);
      } else {
        console.log('✅ Test SMS sent successfully!');
        console.log(`📱 Message ID: ${response.id}`);
        console.log(`📊 Status: ${response.status}`);
        resolve(response);
      }
    });
  });
}

// Run the test
testSMSConfig().catch(console.error);
