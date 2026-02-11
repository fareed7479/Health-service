import mongoose from 'mongoose';

const providerProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  specialization: {
    type: String,
    required: [true, 'Specialization is required']
  },
  licenseNumber: {
    type: String,
    required: [true, 'License number is required'],
    unique: true
  },
  licenseDocument: {
    url: String,
    publicId: String
  },
  experience: {
    type: Number,
    required: [true, 'Experience is required'],
    min: 0
  },
  bio: {
    type: String,
    maxlength: 500
  },
  serviceCategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceCategory'
  }],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  rejectionReason: String,
  isAvailable: {
    type: Boolean,
    default: true
  },
  earnings: {
    total: {
      type: Number,
      default: 0
    },
    pending: {
      type: Number,
      default: 0
    },
    paid: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

export const ProviderProfile = mongoose.model('ProviderProfile', providerProfileSchema);
