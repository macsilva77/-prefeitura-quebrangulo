import { Router } from 'express';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import secretariaRoutes from './secretariaRoutes';
import fornecedorRoutes from './fornecedorRoutes';
import verbaRoutes from './verbaRoutes';

const router = Router();

// Montar rotas
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/secretarias', secretariaRoutes);
router.use('/fornecedores', fornecedorRoutes);
router.use('/verbas', verbaRoutes);

export default router;
