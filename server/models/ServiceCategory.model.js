import mongoose from 'mongoose';

const serviceCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Service name is required'],
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  icon: String,
  basePrice: {
    type: Number,
    required: [true, 'Base price is required'],
    min: 0
  },
  duration: {
    type: Number, // in minutes
    required: [true, 'Duration is required'],
    min: 15
  },
  isActive: {
    type: Boolean,
    default: true
  },
  discount: {
    percentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    validUntil: Date
  }
}, {
  timestamps: true
});

export const ServiceCategory = mongoose.model('ServiceCategory', serviceCategorySchema);
