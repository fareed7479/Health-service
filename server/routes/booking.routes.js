import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { roleMiddleware } from '../middleware/role.middleware.js';
import { createBooking, updateBookingStatus, getAllBookings } from '../controllers/booking.controller.js';

const router = express.Router();

// Customer routes
router.post('/', authMiddleware, roleMiddleware('customer'), createBooking);

// Provider routes
router.patch('/:id/status', authMiddleware, roleMiddleware('provider', 'admin'), updateBookingStatus);

// Admin routes
router.get('/all', authMiddleware, roleMiddleware('admin'), getAllBookings);

export default router;
