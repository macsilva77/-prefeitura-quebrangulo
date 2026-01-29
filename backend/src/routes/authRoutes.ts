import { Router } from 'express';
import { login, register, getProfile, refreshToken } from '../controllers/authController';
import { authenticate } from '../middlewares/auth';

const router = Router();

// Rotas públicas
router.post('/login', login);
router.post('/register', register);
router.post('/refresh-token', refreshToken);

// Rotas protegidas
router.get('/profile', authenticate, getProfile);

export default router;
