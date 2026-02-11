import { User } from '../models/User.model.js';
import { ProviderProfile } from '../models/ProviderProfile.model.js';
import { ServiceCategory } from '../models/ServiceCategory.model.js';
import { Booking } from '../models/Booking.model.js';
import { Payment } from '../models/Payment.model.js';
import { sendEmail } from '../services/email.service.js';

// Get All Users
export const getAllUsers = async (req, res, next) => {
  try {
    const { role, page = 1, limit = 10 } = req.query;
    const query = role ? { role } : {};

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    next(error);
  }
};

// Block/Unblock User
export const blockUnblockUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isBlocked } = req.body;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot block admin user'
      });
    }

    user.isBlocked = isBlocked;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${isBlocked ? 'blocked' : 'unblocked'} successfully`,
      user
    });
  } catch (error) {
    next(error);
  }
};

// Get Pending Providers
export const getPendingProviders = async (req, res, next) => {
  try {
    const providers = await ProviderProfile.find({ status: 'pending' })
      .populate('user', 'name email phone')
      .populate('serviceCategories');

    res.status(200).json({
      success: true,
      providers
    });
  } catch (error) {
    next(error);
  }
};

// Approve/Reject Provider
export const approveRejectProvider = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action, rejectionReason } = req.body; // action: 'approve' or 'reject'

    const providerProfile = await ProviderProfile.findById(id)
      .populate('user');

    if (!providerProfile) {
      return res.status(404).json({
        success: false,
        message: 'Provider profile not found'
      });
    }

    if (action === 'approve') {
      providerProfile.status = 'approved';
      await providerProfile.save();

      // Send approval email
      await sendEmail(
        providerProfile.user.email,
        'Provider Registration Approved',
        `<h2>Congratulations!</h2><p>Your provider registration has been approved. You can now start accepting bookings.</p>`
      );
    } else if (action === 'reject') {
      providerProfile.status = 'rejected';
      providerProfile.rejectionReason = rejectionReason || 'Registration rejected';
      await providerProfile.save();

      // Send rejection email
      await sendEmail(
        providerProfile.user.email,
        'Provider Registration Rejected',
        `<h2>Registration Update</h2><p>Your provider registration has been rejected. Reason: ${rejectionReason || 'Not specified'}</p>`
      );
    }

    res.status(200).json({
      success: true,
      message: `Provider ${action}d successfully`,
      providerProfile
    });
  } catch (error) {
    next(error);
  }
};

// Create Service Category
export const createService = async (req, res, next) => {
  try {
    const service = await ServiceCategory.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      service
    });
  } catch (error) {
    next(error);
  }
};

// Get All Services
export const getAllServices = async (req, res, next) => {
  try {
    const services = await ServiceCategory.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      services
    });
  } catch (error) {
    next(error);
  }
};

// Update Service
export const updateService = async (req, res, next) => {
  try {
    const { id } = req.params;
    const service = await ServiceCategory.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Service updated successfully',
      service
    });
  } catch (error) {
    next(error);
  }
};

// Delete Service
export const deleteService = async (req, res, next) => {
  try {
    const { id } = req.params;
    const service = await ServiceCategory.findByIdAndDelete(id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get Dashboard Stats
export const getDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'customer' });
    const totalProviders = await User.countDocuments({ role: 'provider' });
    const totalBookings = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    const completedBookings = await Booking.countDocuments({ status: 'completed' });
    
    const totalRevenue = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const recentBookings = await Booking.find()
      .populate('customer', 'name')
      .populate('service')
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalProviders,
        totalBookings,
        pendingBookings,
        completedBookings,
        totalRevenue: totalRevenue[0]?.total || 0
      },
      recentBookings
    });
  } catch (error) {
    next(error);
  }
};

// Export Bookings (PDF/Excel - simplified, returns JSON)
export const exportBookings = async (req, res, next) => {
  try {
    const { format = 'json', startDate, endDate } = req.query;
    const query = {};

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const bookings = await Booking.find(query)
      .populate('customer', 'name email phone')
      .populate('provider', 'name email phone')
      .populate('service')
      .populate('payment')
      .sort({ createdAt: -1 });

    if (format === 'json') {
      res.status(200).json({
        success: true,
        bookings
      });
    } else {
      // For PDF/Excel, you would use libraries like pdfkit or exceljs
      // For now, returning JSON
      res.status(200).json({
        success: true,
        message: 'Export functionality - use libraries like pdfkit or exceljs for PDF/Excel generation',
        bookings
      });
    }
  } catch (error) {
    next(error);
  }
};
