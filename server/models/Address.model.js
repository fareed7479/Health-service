import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  label: {
    type: String,
    required: [true, 'Address label is required'],
    enum: ['Home', 'Work', 'Other']
  },
  addressLine1: {
    type: String,
    required: [true, 'Address line 1 is required']
  },
  addressLine2: String,
  city: {
    type: String,
    required: [true, 'City is required']
  },
  state: {
    type: String,
    required: [true, 'State is required']
  },
  pincode: {
    type: String,
    required: [true, 'Pincode is required']
  },
  country: {
    type: String,
    default: 'India'
  },
  coordinates: {
    latitude: Number,
    longitude: Number
  },
  isDefault: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export const Address = mongoose.model('Address', addressSchema);
