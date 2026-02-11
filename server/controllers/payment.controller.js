import Razorpay from 'razorpay';
import crypto from 'crypto';
import { Payment } from '../models/Payment.model.js';
import { Booking } from '../models/Booking.model.js';

const isRazorpayEnabled = process.env.RAZORPAY_ENABLED === 'true';

let razorpay;
if (isRazorpayEnabled) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
}

// Create Razorpay Order
export const createOrder = async (req, res, next) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId)
      .populate('service');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.customer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    if (booking.payment) {
      const existingPayment = await Payment.findById(booking.payment);
      if (existingPayment.status === 'completed') {
        return res.status(400).json({
          success: false,
          message: 'Payment already completed'
        });
      }
    }

    const amountInPaise = booking.amount.finalAmount * 100; // Convert to paise

    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `booking_${bookingId}_${Date.now()}`,
      notes: {
        bookingId: bookingId.toString(),
        customerId: req.user.id.toString()
      }
    };

    let order;

    if (isRazorpayEnabled && razorpay) {
      // Real Razorpay order creation (production / enabled mode)
      order = await razorpay.orders.create(options);
    } else {
      // Mock order for development when Razorpay is disabled
      order = {
        id: `order_dummy_${bookingId}_${Date.now()}`,
        amount: amountInPaise,
        currency: 'INR'
      };
    }

    // Create payment record
    let payment = await Payment.findOne({ booking: bookingId });
    if (!payment) {
      payment = await Payment.create({
        booking: bookingId,
        customer: req.user.id,
        razorpayOrderId: order.id,
        amount: booking.amount.finalAmount,
        status: 'pending'
      });
      booking.payment = payment._id;
      await booking.save();
    } else {
      payment.razorpayOrderId = order.id;
      await payment.save();
    }

    const responseOrder = {
      id: order.id,
      amount: order.amount,
      currency: order.currency
    };

    // Preserve existing response shape for real Razorpay flow
    if (isRazorpayEnabled) {
      responseOrder.key = process.env.RAZORPAY_KEY_ID;
    }

    res.status(200).json({
      success: true,
      order: responseOrder,
      paymentId: payment._id
    });
  } catch (error) {
    next(error);
  }
};

// Verify Payment
export const verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentId } = req.body;

    const payment = await Payment.findById(paymentId);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // In development/mock mode, skip Razorpay signature verification
    if (!isRazorpayEnabled) {
      // Mark payment as completed (equivalent to "paid" within existing enum)
      payment.razorpayPaymentId = razorpay_payment_id || payment.razorpayPaymentId;
      payment.razorpaySignature = razorpay_signature || payment.razorpaySignature;
      payment.status = 'completed';
      await payment.save();

      // Update booking status to accepted (current "confirmed" state in the app)
      const booking = await Booking.findById(payment.booking);
      if (booking && booking.status === 'pending') {
        booking.status = 'accepted';
        await booking.save();
      }

      return res.status(200).json({
        success: true,
        message: 'Payment verified successfully (mock mode)',
        payment
      });
    }

    // Verify signature
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }

    // Update payment
    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;
    payment.status = 'completed';
    await payment.save();

    // Update booking status
    const booking = await Booking.findById(payment.booking);
    if (booking.status === 'pending') {
      booking.status = 'accepted';
      await booking.save();
    }

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      payment
    });
  } catch (error) {
    next(error);
  }
};
