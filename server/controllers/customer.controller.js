import { Address } from '../models/Address.model.js';
import { Booking } from '../models/Booking.model.js';
import { ServiceCategory } from '../models/ServiceCategory.model.js';
import { User } from '../models/User.model.js';

// Get All Services
export const getServices = async (req, res, next) => {
  try {
    const services = await ServiceCategory.find({ isActive: true });
    res.status(200).json({
      success: true,
      services
    });
  } catch (error) {
    next(error);
  }
};

// Add Address
export const addAddress = async (req, res, next) => {
  try {
    const addressData = {
      ...req.body,
      user: req.user.id
    };

    const address = await Address.create(addressData);

    await User.findByIdAndUpdate(req.user.id, {
      $push: { addresses: address._id }
    });

    // If this is the first address or marked as default, set it as default
    if (req.body.isDefault || req.user.addresses.length === 0) {
      await User.findByIdAndUpdate(req.user.id, {
        defaultAddress: address._id
      });
      address.isDefault = true;
      await address.save();
    }

    res.status(201).json({
      success: true,
      message: 'Address added successfully',
      address
    });
  } catch (error) {
    next(error);
  }
};

// Get My Addresses
export const getMyAddresses = async (req, res, next) => {
  try {
    const addresses = await Address.find({ user: req.user.id });
    res.status(200).json({
      success: true,
      addresses
    });
  } catch (error) {
    next(error);
  }
};

// Update Address
export const updateAddress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const address = await Address.findOne({ _id: id, user: req.user.id });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    Object.assign(address, req.body);
    await address.save();

    if (req.body.isDefault) {
      await User.findByIdAndUpdate(req.user.id, {
        defaultAddress: address._id
      });
      await Address.updateMany(
        { user: req.user.id, _id: { $ne: id } },
        { isDefault: false }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Address updated successfully',
      address
    });
  } catch (error) {
    next(error);
  }
};

// Delete Address
export const deleteAddress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const address = await Address.findOne({ _id: id, user: req.user.id });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    await Address.findByIdAndDelete(id);
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { addresses: id }
    });

    res.status(200).json({
      success: true,
      message: 'Address deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get My Bookings
export const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ customer: req.user.id })
      .populate('service')
      .populate('provider', 'name phone email')
      .populate('providerProfile', 'specialization rating')
      .populate('address')
      .populate('payment')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      bookings
    });
  } catch (error) {
    next(error);
  }
};

// Get Booking by ID
export const getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findOne({ _id: id, customer: req.user.id })
      .populate('service')
      .populate('provider', 'name phone email')
      .populate('providerProfile', 'specialization rating')
      .populate('address')
      .populate('payment');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.status(200).json({
      success: true,
      booking
    });
  } catch (error) {
    next(error);
  }
};
