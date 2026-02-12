import { User } from '../models/User.model.js';
import { ProviderProfile } from '../models/ProviderProfile.model.js';
import { ServiceCategory } from '../models/ServiceCategory.model.js';
import { Booking } from '../models/Booking.model.js';
import { Payment } from '../models/Payment.model.js';
import { sendEmail } from '../services/email.service.js';

// Get All Users
export const getAllUsers = async (req, res, next) => {
  try {
    const { role, page = 1, limit = 10, status } = req.query;
    const query = {};
    
    if (role) query.role = role;
    if (status === 'blocked') query.isBlocked = true;
    if (status === 'active') query.isBlocked = false;

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
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
};

// Block/Unblock User
export const blockUnblockUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isBlocked } = req.body;

    if (typeof isBlocked !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isBlocked must be a boolean value'
      });
    }

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

    console.log(`✅ User ${isBlocked ? 'blocked' : 'unblocked'}: ${user.email}`);

    res.status(200).json({
      success: true,
      message: `User ${isBlocked ? 'blocked' : 'unblocked'} successfully`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isBlocked: user.isBlocked
      }
    });
  } catch (error) {
    console.error('Block/unblock user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user status'
    });
  }
};

// Get Pending Providers
export const getPendingProviders = async (req, res, next) => {
  try {
    // Query providers by unverified status (via User.role=provider AND User.isVerified=false)
    const providers = await User.find({ role: 'provider', isVerified: false })
      .select('-password')
      .sort({ createdAt: -1 });

    // Also get their profile details if exists
    const providersWithProfiles = await Promise.all(
      providers.map(async (provider) => {
        const profile = await ProviderProfile.findOne({ user: provider._id })
          .populate('serviceCategories');
        return {
          _id: provider._id,
          name: provider.name,
          email: provider.email,
          phone: provider.phone,
          isVerified: provider.isVerified,
          createdAt: provider.createdAt,
          profile
        };
      })
    );

    res.status(200).json({
      success: true,
      providers: providersWithProfiles,
      count: providersWithProfiles.length
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

    // Find the user (provider)
    const user = await User.findById(id);
    if (!user || user.role !== 'provider') {
      return res.status(404).json({
        success: false,
        message: 'Provider user not found'
      });
    }

    // Find the provider profile
    let providerProfile = await ProviderProfile.findOne({ user: id });
    
    // Safety check: Create profile if missing (backward compatibility)
    if (!providerProfile) {
      console.log(`⚠️  ProviderProfile missing for ${user.email}, creating with default values`);
      providerProfile = await ProviderProfile.create({
        user: id,
        specialization: 'Not specified',
        experience: 0,
        licenseNumber: `LEGACY-${id.toString().slice(-8)}`,
        bio: 'Profile created automatically during approval.',
        status: 'pending'
      });
    }

    if (action === 'approve') {
      // Mark user as verified
      user.isVerified = true;
      await user.save();

      // Update profile status
      providerProfile.status = 'approved';
      await providerProfile.save();

      console.log(`✅ Provider approved: ${user.email}`);

      // Send approval email
      try {
        await sendEmail(
          user.email,
          'Provider Registration Approved',
          `<h2>Congratulations!</h2><p>Your provider registration has been approved by the admin. You can now log in and start accepting bookings.</p>`
        );
      } catch (emailError) {
        console.error('Email send error:', emailError.message);
      }
    } else if (action === 'reject') {
      // Keep user unverified
      providerProfile.status = 'rejected';
      providerProfile.rejectionReason = rejectionReason || 'Registration rejected';
      await providerProfile.save();

      console.log(`❌ Provider rejected: ${user.email}`);

      // Send rejection email
      try {
        await sendEmail(
          user.email,
          'Provider Registration Rejected',
          `<h2>Registration Update</h2><p>Your provider registration has been rejected. Reason: ${rejectionReason || 'Not specified'}</p>`
        );
      } catch (emailError) {
        console.error('Email send error:', emailError.message);
      }
    }

    res.status(200).json({
      success: true,
      message: `Provider ${action}ed successfully`,
      provider: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
        status: providerProfile.status
      }
    });
  } catch (error) {
    console.error('Approve/Reject error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error processing provider approval'
    });
  }
};

// Create Service Category
export const createService = async (req, res, next) => {
  try {
    const { name, description, basePrice, duration, discount, isActive } = req.body;

    // Validate required fields
    if (!name || !description || basePrice === undefined || !duration) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, description, basePrice, duration'
      });
    }

    // Validate field types
    if (typeof basePrice !== 'number' || basePrice < 0) {
      return res.status(400).json({
        success: false,
        message: 'basePrice must be a positive number'
      });
    }

    if (typeof duration !== 'number' || duration < 15) {
      return res.status(400).json({
        success: false,
        message: 'duration must be a number (in minutes) and at least 15 minutes'
      });
    }

    const service = await ServiceCategory.create({
      name,
      description,
      basePrice,
      duration,
      discount: discount || { percentage: 0 },
      isActive: isActive !== undefined ? isActive : true
    });

    console.log(`✅ Service created: ${service._id}`);
    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      service
    });
  } catch (error) {
    console.error('Create service error:', error.message);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Service name already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create service'
    });
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
    const { name, description, basePrice, duration, discount, isActive } = req.body;

    // Validate if basePrice is provided
    if (basePrice !== undefined && (typeof basePrice !== 'number' || basePrice < 0)) {
      return res.status(400).json({
        success: false,
        message: 'basePrice must be a positive number'
      });
    }

    // Validate if duration is provided
    if (duration !== undefined && (typeof duration !== 'number' || duration < 15)) {
      return res.status(400).json({
        success: false,
        message: 'duration must be a number (in minutes) and at least 15 minutes'
      });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (basePrice !== undefined) updateData.basePrice = basePrice;
    if (duration !== undefined) updateData.duration = duration;
    if (discount !== undefined) updateData.discount = discount;
    if (isActive !== undefined) updateData.isActive = isActive;

    const service = await ServiceCategory.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    console.log(`✅ Service updated: ${service._id}`);
    res.status(200).json({
      success: true,
      message: 'Service updated successfully',
      service
    });
  } catch (error) {
    console.error('Update service error:', error.message);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Service name already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update service'
    });
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
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalProviders = await User.countDocuments({ role: 'provider' });
    const approvedProviders = await User.countDocuments({ role: 'provider', isVerified: true });
    const pendingProviders = await User.countDocuments({ role: 'provider', isVerified: false });
    const blockedUsers = await User.countDocuments({ isBlocked: true });

    const totalBookings = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    const completedBookings = await Booking.countDocuments({ status: 'completed' });
    const cancelledBookings = await Booking.countDocuments({ status: 'cancelled' });
    
    const totalRevenue = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const totalServices = await ServiceCategory.countDocuments();
    const activeServices = await ServiceCategory.countDocuments({ isActive: true });

    const recentBookings = await Booking.find()
      .populate('customer', 'name email')
      .populate('provider', 'name email')
      .populate('service', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      stats: {
        users: {
          totalCustomers,
          totalProviders,
          approvedProviders,
          pendingProviders,
          blockedUsers
        },
        bookings: {
          totalBookings,
          pendingBookings,
          completedBookings,
          cancelledBookings
        },
        revenue: totalRevenue[0]?.total || 0,
        services: {
          totalServices,
          activeServices
        }
      },
      recentBookings
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics'
    });
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
