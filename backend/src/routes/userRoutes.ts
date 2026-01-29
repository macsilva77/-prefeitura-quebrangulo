import { Router } from 'express';
import {
  getAll,
  getById,
  update,
  updatePassword,
  deleteUser,
} from '../controllers/userController';
import { authenticate, adminOnly } from '../middlewares/auth';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticate);

// Listar usuários - apenas admin
router.get('/', adminOnly, getAll);

// Buscar usuário por ID - admin ou próprio usuário
router.get('/:id', getById);

// Atualizar usuário - admin ou próprio usuário
router.put('/:id', update);

// Atualizar senha - qualquer usuário autenticado (própria senha)
router.put('/:id/password', updatePassword);

// Deletar usuário - apenas admin
router.delete('/:id', adminOnly, deleteUser);

export default router;
