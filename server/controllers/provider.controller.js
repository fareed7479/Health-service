import { ProviderProfile } from '../models/ProviderProfile.model.js';
import { Booking } from '../models/Booking.model.js';
import { User } from '../models/User.model.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinary.js';

// Register as Provider
export const registerProvider = async (req, res, next) => {
  try {
    const { specialization, licenseNumber, experience, bio, serviceCategories } = req.body;

    // Check if provider profile already exists
    const existingProfile = await ProviderProfile.findOne({ user: req.user.id });
    if (existingProfile) {
      return res.status(400).json({
        success: false,
        message: 'Provider profile already exists'
      });
    }

    // Check if license number is already taken
    const existingLicense = await ProviderProfile.findOne({ licenseNumber });
    if (existingLicense) {
      return res.status(400).json({
        success: false,
        message: 'License number already registered'
      });
    }

    let licenseDocument = null;
    if (req.file) {
      licenseDocument = await uploadToCloudinary(req.file, 'provider-licenses');
    }

    const providerProfile = await ProviderProfile.create({
      user: req.user.id,
      specialization,
      licenseNumber,
      experience,
      bio,
      serviceCategories: serviceCategories || [],
      licenseDocument: licenseDocument ? {
        url: licenseDocument.url,
        publicId: licenseDocument.publicId
      } : undefined,
      status: 'pending'
    });

    // Update user role
    await User.findByIdAndUpdate(req.user.id, { role: 'provider' });

    res.status(201).json({
      success: true,
      message: 'Provider registration submitted. Waiting for admin approval.',
      providerProfile
    });
  } catch (error) {
    next(error);
  }
};

// Get Provider Jobs
export const getProviderJobs = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = { provider: req.user.id };
    if (status) {
      query.status = status;
    }

    const jobs = await Booking.find(query)
      .populate('customer', 'name phone email')
      .populate('service')
      .populate('address')
      .populate('payment')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      jobs
    });
  } catch (error) {
    next(error);
  }
};

// Accept/Reject Booking
export const acceptRejectBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'accept' or 'reject'

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.provider?.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    if (action === 'accept') {
      booking.status = 'accepted';
    } else if (action === 'reject') {
      booking.status = 'rejected';
      booking.cancellationReason = req.body.reason || 'Provider rejected';
    }

    await booking.save();

    res.status(200).json({
      success: true,
      message: `Booking ${action}ed successfully`,
      booking
    });
  } catch (error) {
    next(error);
  }
};

// Update Job Status
export const updateJobStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['accepted', 'provider_arriving', 'in_progress', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.provider?.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    booking.status = status;
    if (status === 'completed') {
      booking.completedAt = new Date();
      
      // Update provider earnings
      const providerProfile = await ProviderProfile.findOne({ user: req.user.id });
      if (providerProfile) {
        providerProfile.earnings.total += booking.amount.finalAmount;
        providerProfile.earnings.pending += booking.amount.finalAmount;
        await providerProfile.save();
      }
    }

    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Job status updated',
      booking
    });
  } catch (error) {
    next(error);
  }
};

// Upload Report
export const uploadReport = async (req, res, next) => {
  try {
    const { bookingId } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.provider?.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const report = await uploadToCloudinary(req.file, 'booking-reports');

    booking.reports.push({
      url: report.url,
      publicId: report.publicId,
      uploadedAt: new Date()
    });

    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Report uploaded successfully',
      report
    });
  } catch (error) {
    next(error);
  }
};

// Get Provider Earnings
export const getProviderEarnings = async (req, res, next) => {
  try {
    const providerProfile = await ProviderProfile.findOne({ user: req.user.id });

    if (!providerProfile) {
      return res.status(404).json({
        success: false,
        message: 'Provider profile not found'
      });
    }

    // Get recent bookings for analytics
    const recentBookings = await Booking.find({
      provider: req.user.id,
      status: 'completed'
    })
      .sort({ completedAt: -1 })
      .limit(10)
      .populate('service')
      .populate('customer', 'name');

    res.status(200).json({
      success: true,
      earnings: providerProfile.earnings,
      recentBookings
    });
  } catch (error) {
    next(error);
  }
};

// Get Provider Profile
export const getProviderProfile = async (req, res, next) => {
  try {
    const providerProfile = await ProviderProfile.findOne({ user: req.user.id })
      .populate('serviceCategories')
      .populate('user', 'name email phone');

    if (!providerProfile) {
      return res.status(404).json({
        success: false,
        message: 'Provider profile not found'
      });
    }

    res.status(200).json({
      success: true,
      providerProfile
    });
  } catch (error) {
    next(error);
  }
};
