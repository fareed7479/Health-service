import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { roleMiddleware } from '../middleware/role.middleware.js';
import {
  getServices,
  addAddress,
  getMyAddresses,
  updateAddress,
  deleteAddress,
  getMyBookings,
  getBookingById
} from '../controllers/customer.controller.js';

const router = express.Router();

// All routes require authentication and customer role
router.use(authMiddleware);
router.use(roleMiddleware('customer'));

router.get('/services', getServices);
router.post('/addresses', addAddress);
router.get('/addresses', getMyAddresses);
router.put('/addresses/:id', updateAddress);
router.delete('/addresses/:id', deleteAddress);
router.get('/bookings', getMyBookings);
router.get('/bookings/:id', getBookingById);

export default router;
