import express from 'express';

import apiRoutes from './api_routes';
import authRoutes from './auth_routes';

const router = express.Router();

router.use('/api/v1', apiRoutes);
router.use('/auth', authRoutes);

export default router;