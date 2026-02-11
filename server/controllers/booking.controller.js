import { Booking } from '../models/Booking.model.js';
import { ServiceCategory } from '../models/ServiceCategory.model.js';
import { ProviderProfile } from '../models/ProviderProfile.model.js';
import { User } from '../models/User.model.js';
import { sendBookingConfirmation, sendStatusUpdate } from '../services/email.service.js';
import { sendBookingStatusSMS } from '../services/sms.service.js';

// Create Booking
export const createBooking = async (req, res, next) => {
  try {
    const { serviceId, addressId, scheduledDate, scheduledTime, providerId } = req.body;

    // Validate service
    const service = await ServiceCategory.findById(serviceId);
    if (!service || !service.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Service not found or inactive'
      });
    }

    // Calculate amount
    const basePrice = service.basePrice;
    const discount = service.discount?.percentage || 0;
    const discountAmount = (basePrice * discount) / 100;
    const finalAmount = basePrice - discountAmount;

    // Find provider if specified, otherwise auto-assign
    let provider = null;
    let providerProfile = null;

    if (providerId) {
      provider = await User.findById(providerId);
      if (!provider || provider.role !== 'provider') {
        return res.status(404).json({
          success: false,
          message: 'Provider not found'
        });
      }
      providerProfile = await ProviderProfile.findOne({ user: providerId, status: 'approved' });
      if (!providerProfile) {
        return res.status(400).json({
          success: false,
          message: 'Provider not approved'
        });
      }
    } else {
      // Auto-assign available provider
      const availableProviders = await ProviderProfile.find({
        status: 'approved',
        isAvailable: true,
        serviceCategories: serviceId
      }).populate('user');

      if (availableProviders.length > 0) {
        providerProfile = availableProviders[0];
        provider = providerProfile.user;
      }
    }

    // Create booking
    const booking = await Booking.create({
      customer: req.user.id,
      provider: provider?._id,
      providerProfile: providerProfile?._id,
      service: serviceId,
      address: addressId,
      scheduledDate,
      scheduledTime,
      amount: {
        basePrice,
        discount: discountAmount,
        finalAmount
      },
      status: provider ? 'accepted' : 'pending'
    });

    await booking.populate('service');
    await booking.populate('address');
    if (provider) {
      await booking.populate('provider', 'name phone email');
    }

    // Send confirmation email
    const customer = await User.findById(req.user.id);
    await sendBookingConfirmation(customer.email, {
      serviceName: service.name,
      scheduledDate: booking.scheduledDate,
      scheduledTime: booking.scheduledTime,
      amount: finalAmount
    });

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking
    });
  } catch (error) {
    next(error);
  }
};

// Update Booking Status (for providers)
export const updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const booking = await Booking.findById(id)
      .populate('customer')
      .populate('service');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user is the provider or admin
    if (req.user.role === 'provider' && booking.provider?.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this booking'
      });
    }

    booking.status = status;
    if (status === 'completed') {
      booking.completedAt = new Date();
    }
    await booking.save();

    // Send notifications
    if (booking.customer) {
      await sendStatusUpdate(booking.customer.email, booking._id, status);
      await sendBookingStatusSMS(booking.customer.phone, booking._id, status);
    }

    res.status(200).json({
      success: true,
      message: 'Booking status updated',
      booking
    });
  } catch (error) {
    next(error);
  }
};

// Get All Bookings (for admin)
export const getAllBookings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = status ? { status } : {};

    const bookings = await Booking.find(query)
      .populate('customer', 'name email phone')
      .populate('provider', 'name email phone')
      .populate('service')
      .populate('address')
      .populate('payment')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Booking.countDocuments(query);

    res.status(200).json({
      success: true,
      bookings,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    next(error);
  }
};
