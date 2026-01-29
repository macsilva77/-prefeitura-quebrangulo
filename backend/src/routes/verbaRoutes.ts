import { Router } from 'express';
import {
  getAll,
  getById,
  create,
  update,
  aprovar,
  pagar,
  cancelar,
  getStats,
} from '../controllers/verbaController';
import { authenticate, canEdit, adminOnly } from '../middlewares/auth';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticate);

// Listar verbas - todos podem ver
router.get('/', getAll);

// Obter estatísticas - todos podem ver
router.get('/stats', getStats);

// Buscar verba por ID - todos podem ver
router.get('/:id', getById);

// Criar verba - admin e user podem criar
router.post('/', canEdit, create);

// Atualizar verba - admin e user podem editar
router.put('/:id', canEdit, update);

// Aprovar verba - apenas admin
router.patch('/:id/aprovar', adminOnly, aprovar);

// Pagar verba - apenas admin
router.patch('/:id/pagar', adminOnly, pagar);

// Cancelar verba - apenas admin
router.patch('/:id/cancelar', adminOnly, cancelar);

export default router;
