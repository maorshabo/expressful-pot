import express from 'express';

import authController from './controllers/auth';

const router = express.Router();

router.post('/login', authController.login);
router.post('/signup', authController.signup);
router.post('/recovery', authController.recovery);
router.post('/reset/:token', authController.reset);

export default router;