import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { roleMiddleware } from '../middleware/role.middleware.js';
import { upload } from '../utils/multer.js';
import {
  registerProvider,
  getProviderJobs,
  acceptRejectBooking,
  updateJobStatus,
  uploadReport,
  getProviderEarnings,
  getProviderProfile
} from '../controllers/provider.controller.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/register', upload.single('licenseDocument'), registerProvider);
router.get('/profile', getProviderProfile);
router.get('/jobs', roleMiddleware('provider'), getProviderJobs);
router.patch('/jobs/:id/accept-reject', roleMiddleware('provider'), acceptRejectBooking);
router.patch('/jobs/:id/status', roleMiddleware('provider'), updateJobStatus);
router.post('/upload-report', roleMiddleware('provider'), upload.single('report'), uploadReport);
router.get('/earnings', roleMiddleware('provider'), getProviderEarnings);

export default router;
