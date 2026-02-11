import twilio from 'twilio';
import { logger } from '../utils/logger.js';

let twilioClient = null;

if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

export const sendSMS = async (phone, message) => {
  if (!twilioClient) {
    logger.warn('Twilio not configured, SMS not sent');
    return { success: false, message: 'SMS service not configured' };
  }

  try {
    const result = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone
    });
    logger.info(`SMS sent: ${result.sid}`);
    return { success: true, messageId: result.sid };
  } catch (error) {
    logger.error('SMS sending error:', error);
    throw error;
  }
};

export const sendOTPSMS = async (phone, otp) => {
  const message = `Your OTP for Healthcare Platform is ${otp}. Valid for 10 minutes. Do not share this code.`;
  return await sendSMS(phone, message);
};

export const sendBookingStatusSMS = async (phone, bookingId, status) => {
  const statusMessages = {
    accepted: 'Your booking has been accepted.',
    provider_arriving: 'Provider is on the way.',
    in_progress: 'Service in progress.',
    completed: 'Service completed successfully.'
  };
  const message = `Booking ${bookingId}: ${statusMessages[status] || 'Status updated'}`;
  return await sendSMS(phone, message);
};
