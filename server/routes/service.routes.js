import express from 'express';
import { getServices } from '../controllers/customer.controller.js';

const router = express.Router();

// Public route to get active services
router.get('/', getServices);

export default router;
