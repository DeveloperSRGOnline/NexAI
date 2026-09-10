import { Router } from 'express';
import {
  googleRedirect,
  googleCallback,
  getCurrentUser,
  logout,
  devLogin,
} from '../controllers/auth.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = Router();

// OAuth initiation & callback
router.get('/google', googleRedirect);
router.get('/google/callback', googleCallback);

// Protected user endpoint
router.get('/me', authMiddleware, getCurrentUser);

// Session termination
router.post('/logout', logout);

// Local developer mock login
router.post('/dev-login', devLogin);

export default router;
