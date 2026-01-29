import User from './User';
import Secretaria from './Secretaria';
import Fornecedor from './Fornecedor';
import Verba from './Verba';

// ==================== RELACIONAMENTOS ====================

// User - Verba (1:N)
// Um usuário pode criar várias verbas
User.hasMany(Verba, {
  foreignKey: 'user_id',
  as: 'verbas',
});
Verba.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'usuario',
});

// Secretaria - Verba (1:N)
// Uma secretaria pode ter várias verbas
Secretaria.hasMany(Verba, {
  foreignKey: 'secretaria_id',
  as: 'verbas',
});
Verba.belongsTo(Secretaria, {
  foreignKey: 'secretaria_id',
  as: 'secretaria',
});

// Fornecedor - Verba (1:N)
// Um fornecedor pode ter várias verbas
Fornecedor.hasMany(Verba, {
  foreignKey: 'fornecedor_id',
  as: 'verbas',
});
Verba.belongsTo(Fornecedor, {
  foreignKey: 'fornecedor_id',
  as: 'fornecedor',
});

// ==================== EXPORTAR MODELS ====================

export {
  User,
  Secretaria,
  Fornecedor,
  Verba,
};

// Exportar objeto com todos os models
const models = {
  User,
  Secretaria,
  Fornecedor,
  Verba,
};

export default models;
