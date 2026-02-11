import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  providerProfile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProviderProfile'
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceCategory',
    required: true
  },
  address: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Address',
    required: true
  },
  scheduledDate: {
    type: Date,
    required: [true, 'Scheduled date is required']
  },
  scheduledTime: {
    type: String,
    required: [true, 'Scheduled time is required']
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'provider_arriving', 'in_progress', 'completed', 'cancelled', 'rejected'],
    default: 'pending'
  },
  amount: {
    basePrice: Number,
    discount: Number,
    finalAmount: Number
  },
  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  },
  reports: [{
    url: String,
    publicId: String,
    uploadedAt: Date
  }],
  notes: String,
  cancellationReason: String,
  completedAt: Date
}, {
  timestamps: true
});

bookingSchema.index({ customer: 1, createdAt: -1 });
bookingSchema.index({ provider: 1, status: 1 });

export const Booking = mongoose.model('Booking', bookingSchema);
