import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';

// Definir atributos da Secretaria
interface SecretariaAttributes {
  id: number;
  nome: string;
  codigo?: string;
  descricao?: string;
  orcamento_total: number;
  orcamento_utilizado: number;
  responsavel?: string;
  telefone?: string;
  email?: string;
  ativo: boolean;
  created_at?: Date;
  updated_at?: Date;
}

// Atributos opcionais para criação
interface SecretariaCreationAttributes 
  extends Optional<SecretariaAttributes, 'id' | 'codigo' | 'descricao' | 'orcamento_utilizado' | 'responsavel' | 'telefone' | 'email' | 'ativo' | 'created_at' | 'updated_at'> {}

// Classe do Model
class Secretaria extends Model<SecretariaAttributes, SecretariaCreationAttributes> implements SecretariaAttributes {
  public id!: number;
  public nome!: string;
  public codigo?: string;
  public descricao?: string;
  public orcamento_total!: number;
  public orcamento_utilizado!: number;
  public responsavel?: string;
  public telefone?: string;
  public email?: string;
  public ativo!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // Método para calcular orçamento disponível
  public getOrcamentoDisponivel(): number {
    return this.orcamento_total - this.orcamento_utilizado;
  }

  // Método para calcular percentual utilizado
  public getPercentualUtilizado(): number {
    if (this.orcamento_total === 0) return 0;
    return (this.orcamento_utilizado / this.orcamento_total) * 100;
  }
}

// Inicializar o model
Secretaria.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nome: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [3, 100],
      },
    },
    codigo: {
      type: DataTypes.STRING(20),
      allowNull: true,
      unique: true,
    },
    descricao: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    orcamento_total: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    orcamento_utilizado: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    responsavel: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    telefone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        isEmail: true,
      },
    },
    ativo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'secretarias',
    timestamps: true,
    underscored: true,
  }
);

export default Secretaria;
