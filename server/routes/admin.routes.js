import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { roleMiddleware } from '../middleware/role.middleware.js';
import {
  getAllUsers,
  blockUnblockUser,
  getPendingProviders,
  approveRejectProvider,
  createService,
  getAllServices,
  updateService,
  deleteService,
  getDashboardStats,
  exportBookings
} from '../controllers/admin.controller.js';

const router = express.Router();

router.use(authMiddleware);
router.use(roleMiddleware('admin'));

// User Management
router.get('/users', getAllUsers);
router.patch('/users/:id/block', blockUnblockUser);

// Provider Management
router.get('/providers/pending', getPendingProviders);
router.patch('/providers/:id/approve-reject', approveRejectProvider);

// Service Management
router.post('/services', createService);
router.get('/services', getAllServices);
router.put('/services/:id', updateService);
router.delete('/services/:id', deleteService);

// Dashboard
router.get('/dashboard/stats', getDashboardStats);
router.get('/bookings/export', exportBookings);

export default router;
