import { Router } from 'express';
import {
  getAll,
  getById,
  create,
  update,
  deleteFornecedor,
} from '../controllers/fornecedorController';
import { authenticate, canEdit, adminOnly } from '../middlewares/auth';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticate);

// Listar fornecedores - todos podem ver
router.get('/', getAll);

// Buscar fornecedor por ID - todos podem ver
router.get('/:id', getById);

// Criar fornecedor - admin e user podem criar
router.post('/', canEdit, create);

// Atualizar fornecedor - admin e user podem editar
router.put('/:id', canEdit, update);

// Deletar fornecedor - apenas admin
router.delete('/:id', adminOnly, deleteFornecedor);

export default router;
