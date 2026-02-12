import jwt from 'jsonwebtoken';
import { User } from '../models/User.model.js';
import { ProviderProfile } from '../models/ProviderProfile.model.js';
import { generateOTP, setOTPExpiry } from '../utils/otpGenerator.js';
import { sendOTPEmail } from '../services/email.service.js';
import { sendOTPSMS } from '../services/sms.service.js';
import { logger } from '../utils/logger.js';

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// Register User
export const register = async (req, res, next) => {
  try {
    const { name, email: rawEmail, phone, password, role, specialization, experience, licenseNumber, bio } = req.body;
    const email = rawEmail.toLowerCase();

    // Validate role - prevent admin registration from public endpoint
    const validRoles = ['customer', 'provider'];
    const userRole = role && validRoles.includes(role) ? role : 'customer';
    
    if (role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin registration is not allowed through this endpoint'
      });
    }

    // Validate provider fields if registering as provider
    if (userRole === 'provider') {
      if (!specialization || !experience || !licenseNumber || !bio) {
        return res.status(400).json({
          success: false,
          message: 'Provider details are required: specialization, experience, licenseNumber, and bio'
        });
      }

      // Validate experience is a number
      const expNum = Number(experience);
      if (isNaN(expNum) || expNum < 0) {
        return res.status(400).json({
          success: false,
          message: 'Experience must be a valid positive number'
        });
      }

      // Validate licenseNumber is not empty
      if (licenseNumber.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'License number cannot be empty'
        });
      }

      // Check if license number already exists
      const existingLicense = await ProviderProfile.findOne({ licenseNumber: licenseNumber.trim() });
      if (existingLicense) {
        return res.status(400).json({
          success: false,
          message: 'License number already registered'
        });
      }
    }

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email or phone'
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = setOTPExpiry(10);

    // Create user
    const user = await User.create({
      name,
      email,
      phone,
      password: password || undefined, // Only if provided
      role: userRole,
      otp: {
        code: otp,
        expiresAt: otpExpiry
      }
    });

    console.log(`👤 New user registered: ${user.email} (Role: ${userRole})`);

    // Create ProviderProfile if registering as provider
    if (userRole === 'provider') {
      const providerProfile = await ProviderProfile.create({
        user: user._id,
        specialization: specialization.trim(),
        experience: Number(experience),
        licenseNumber: licenseNumber.trim(),
        bio: bio.trim(),
        status: 'pending' // Explicitly set to pending
      });

      console.log(`📋 ProviderProfile created for: ${user.email} (Status: pending)`);
    }

    // Send OTP via Email
    if (email) {
      await sendOTPEmail(email, otp);
    }

    // Send OTP via SMS
    if (phone) {
      await sendOTPSMS(phone, otp);
    }

    res.status(201).json({
      success: true,
      message: 'OTP sent to your email and phone',
      userId: user._id
    });
  } catch (error) {
    next(error);
  }
};

// Verify OTP
export const verifyOTP = async (req, res, next) => {
  try {
    const { userId, otp } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.otp || user.otp.code !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    if (new Date() > user.otp.expiresAt) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired'
      });
    }

    // Verify user based on role
    // Customers: auto-verify on OTP
    // Providers: stay pending for admin approval
    if (user.role === 'customer') {
      user.isVerified = true;
      console.log(`✅ Customer verified: ${user.email}`);
    } else if (user.role === 'provider') {
      // Providers stay unverified until admin approves
      console.log(`⏳ Provider registered, pending admin approval: ${user.email}`);
      // isVerified remains false
      
      // Safety check: Create ProviderProfile if missing (for backward compatibility)
      const existingProfile = await ProviderProfile.findOne({ user: user._id });
      if (!existingProfile) {
        console.log(`⚠️  ProviderProfile missing for ${user.email}, creating with default values`);
        await ProviderProfile.create({
          user: user._id,
          specialization: 'Not specified',
          experience: 0,
          licenseNumber: `LEGACY-${user._id.toString().slice(-8)}`, // Fallback license
          bio: 'Profile created automatically. Please update your details.',
          status: 'pending'
        });
      }
    }
    
    user.otp = undefined;
    await user.save();

    const token = generateToken(user._id);

    // Determine message based on user role
    let message = 'OTP verified successfully';
    if (user.role === 'customer') {
      message = 'OTP verified successfully. Welcome!';
    } else if (user.role === 'provider') {
      message = 'OTP verified. Your provider registration is pending admin approval.';
    }

    res.status(200).json({
      success: true,
      message,
      token: user.role === 'customer' ? token : null, // Only return token for verified customers
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified,
        status: user.role === 'provider' ? 'pending_approval' : 'verified'
      }
    });
  } catch (error) {
    next(error);
  }
};

// Login
export const login = async (req, res, next) => {
  try {
    const { email: rawEmail, password } = req.body;
    const email = rawEmail.toLowerCase();

    console.log('\n=== LOGIN AUDIT ===');
    console.log('Login email (normalized):', email);
    console.log('Password provided:', !!password);

    if (!email || !password) {
      console.log('❌ Missing email or password');
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Use case-insensitive regex for robustness
    const user = await User.findOne({
      email: new RegExp(`^${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')
    }).select('+password');

    console.log('User found:', !!user);
    if (user) {
      console.log('Stored email:', user.email);
      console.log('Stored role:', user.role);
      console.log('isVerified:', user.isVerified);
      console.log('isBlocked:', user.isBlocked);
      console.log('Stored password hash exists:', !!user.password);
      console.log('Password hash preview:', user.password ? user.password.substring(0, 30) + '...' : 'NONE');
    }

    if (!user) {
      console.log('❌ User not found');
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if account is blocked
    if (user.isBlocked) {
      console.log('❌ Account is blocked');
      return res.status(403).json({
        success: false,
        message: 'Your account has been blocked'
      });
    }

    console.log('Comparing password...');
    const isPasswordMatch = await user.comparePassword(password);
    console.log('Password match result:', isPasswordMatch);

    if (!isPasswordMatch) {
      console.log('❌ Password mismatch');
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    console.log('✅ Password matched');

    // Role-based verification logic:
    // - Admins: always allowed
    // - Customers: auto-verified, allowed to login immediately
    // - Providers: require admin approval (isVerified check)
    if (user.role === 'provider' && !user.isVerified) {
      console.log('❌ Provider not yet approved by admin');
      return res.status(403).json({
        success: false,
        message: 'Your provider account is pending admin approval'
      });
    }

    const token = generateToken(user._id);
    console.log('✅ Login SUCCESS for:', user.email, '| Role:', user.role);
    console.log('===================\n');

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    console.error('❌ Login error:', error.message);
    console.log('===================\n');
    next(error);
  }
};

// Forgot Password
export const forgotPassword = async (req, res, next) => {
  try {
    const { email: rawEmail } = req.body;
    const email = rawEmail.toLowerCase();

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const otp = generateOTP();
    const otpExpiry = setOTPExpiry(10);

    user.otp = {
      code: otp,
      expiresAt: otpExpiry
    };
    await user.save();

    await sendOTPEmail(email, otp);

    res.status(200).json({
      success: true,
      message: 'OTP sent to your email'
    });
  } catch (error) {
    next(error);
  }
};

// Reset Password
export const resetPassword = async (req, res, next) => {
  try {
    const { email: rawEmail, otp, newPassword } = req.body;
    const email = rawEmail.toLowerCase();

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.otp || user.otp.code !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    if (new Date() > user.otp.expiresAt) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired'
      });
    }

    user.password = newPassword;
    user.otp = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get Current User
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('addresses')
      .populate('defaultAddress');

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};
