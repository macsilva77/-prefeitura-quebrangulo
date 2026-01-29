import { Router } from 'express';
import {
  getAll,
  getById,
  create,
  update,
  deleteSecretaria,
  getStats,
} from '../controllers/secretariaController';
import { authenticate, canEdit, adminOnly } from '../middlewares/auth';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticate);

// Listar secretarias - todos podem ver
router.get('/', getAll);

// Buscar secretaria por ID - todos podem ver
router.get('/:id', getById);

// Obter estatísticas - todos podem ver
router.get('/:id/stats', getStats);

// Criar secretaria - apenas admin
router.post('/', adminOnly, create);

// Atualizar secretaria - admin e user podem editar
router.put('/:id', canEdit, update);

// Deletar secretaria - apenas admin
router.delete('/:id', adminOnly, deleteSecretaria);

export default router;
