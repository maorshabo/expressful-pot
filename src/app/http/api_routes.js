import express from 'express';

import authMiddleware from './middlewares/auth';

import userController from './controllers/userController';

const router = express.Router();

// route middleware
router.use(authMiddleware);

router.get('/users', userController.index);
router.get('/users/:id', userController.show);
router.put('/users/:id', userController.edit);
router.delete('/users/:id', userController.destroy);

export default router;