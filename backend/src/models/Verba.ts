import { Model, DataTypes, Optional, ForeignKey } from 'sequelize';
import sequelize from '../config/database';

// Definir atributos da Verba
interface VerbaAttributes {
  id: number;
  secretaria_id: ForeignKey<number>;
  fornecedor_id: ForeignKey<number>;
  user_id: ForeignKey<number>;
  descricao: string;
  valor: number;
  data_emissao: Date;
  data_vencimento?: Date;
  data_pagamento?: Date;
  numero_nota?: string;
  categoria: string;
  tipo: 'empenho' | 'liquidacao' | 'pagamento';
  status: 'pendente' | 'aprovado' | 'pago' | 'cancelado';
  forma_pagamento?: 'dinheiro' | 'pix' | 'transferencia' | 'cheque' | 'cartao';
  observacoes?: string;
  anexo_url?: string;
  created_at?: Date;
  updated_at?: Date;
}

// Atributos opcionais para criação
interface VerbaCreationAttributes 
  extends Optional<VerbaAttributes, 'id' | 'data_vencimento' | 'data_pagamento' | 'numero_nota' | 'forma_pagamento' | 'observacoes' | 'anexo_url' | 'created_at' | 'updated_at'> {}

// Classe do Model
class Verba extends Model<VerbaAttributes, VerbaCreationAttributes> implements VerbaAttributes {
  public id!: number;
  public secretaria_id!: ForeignKey<number>;
  public fornecedor_id!: ForeignKey<number>;
  public user_id!: ForeignKey<number>;
  public descricao!: string;
  public valor!: number;
  public data_emissao!: Date;
  public data_vencimento?: Date;
  public data_pagamento?: Date;
  public numero_nota?: string;
  public categoria!: string;
  public tipo!: 'empenho' | 'liquidacao' | 'pagamento';
  public status!: 'pendente' | 'aprovado' | 'pago' | 'cancelado';
  public forma_pagamento?: 'dinheiro' | 'pix' | 'transferencia' | 'cheque' | 'cartao';
  public observacoes?: string;
  public anexo_url?: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // Método para verificar se está vencida
  public isVencida(): boolean {
    if (!this.data_vencimento || this.status === 'pago') return false;
    return new Date() > this.data_vencimento;
  }

  // Método para verificar se pode ser paga
  public podePagar(): boolean {
    return this.status === 'aprovado';
  }

  // Método para calcular dias até vencimento
  public diasAteVencimento(): number | null {
    if (!this.data_vencimento) return null;
    const hoje = new Date();
    const diff = this.data_vencimento.getTime() - hoje.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }
}

// Inicializar o model
Verba.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    secretaria_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'secretarias',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    fornecedor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'fornecedores',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    descricao: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    valor: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      validate: {
        min: 0.01,
      },
    },
    data_emissao: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    data_vencimento: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    data_pagamento: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    numero_nota: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    categoria: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    tipo: {
      type: DataTypes.ENUM('empenho', 'liquidacao', 'pagamento'),
      allowNull: false,
      defaultValue: 'empenho',
    },
    status: {
      type: DataTypes.ENUM('pendente', 'aprovado', 'pago', 'cancelado'),
      allowNull: false,
      defaultValue: 'pendente',
    },
    forma_pagamento: {
      type: DataTypes.ENUM('dinheiro', 'pix', 'transferencia', 'cheque', 'cartao'),
      allowNull: true,
    },
    observacoes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    anexo_url: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'verbas',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        name: 'idx_verba_secretaria',
        fields: ['secretaria_id'],
      },
      {
        name: 'idx_verba_fornecedor',
        fields: ['fornecedor_id'],
      },
      {
        name: 'idx_verba_status',
        fields: ['status'],
      },
      {
        name: 'idx_verba_data_emissao',
        fields: ['data_emissao'],
      },
    ],
  }
);

export default Verba;
