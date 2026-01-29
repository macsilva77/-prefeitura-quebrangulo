import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';

// Definir atributos do Fornecedor
interface FornecedorAttributes {
  id: number;
  nome: string;
  cnpj?: string;
  cpf?: string;
  tipo: 'pf' | 'pj';
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  telefone?: string;
  email?: string;
  banco?: string;
  agencia?: string;
  conta?: string;
  pix?: string;
  observacoes?: string;
  ativo: boolean;
  created_at?: Date;
  updated_at?: Date;
}

// Atributos opcionais para criação
interface FornecedorCreationAttributes 
  extends Optional<FornecedorAttributes, 'id' | 'cnpj' | 'cpf' | 'endereco' | 'cidade' | 'estado' | 'cep' | 'telefone' | 'email' | 'banco' | 'agencia' | 'conta' | 'pix' | 'observacoes' | 'ativo' | 'created_at' | 'updated_at'> {}

// Classe do Model
class Fornecedor extends Model<FornecedorAttributes, FornecedorCreationAttributes> implements FornecedorAttributes {
  public id!: number;
  public nome!: string;
  public cnpj?: string;
  public cpf?: string;
  public tipo!: 'pf' | 'pj';
  public endereco?: string;
  public cidade?: string;
  public estado?: string;
  public cep?: string;
  public telefone?: string;
  public email?: string;
  public banco?: string;
  public agencia?: string;
  public conta?: string;
  public pix?: string;
  public observacoes?: string;
  public ativo!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // Método para obter documento formatado
  public getDocumento(): string {
    if (this.tipo === 'pj' && this.cnpj) {
      return this.cnpj;
    }
    if (this.tipo === 'pf' && this.cpf) {
      return this.cpf;
    }
    return 'N/A';
  }

  // Método para obter endereço completo
  public getEnderecoCompleto(): string {
    const partes = [
      this.endereco,
      this.cidade,
      this.estado,
      this.cep,
    ].filter(Boolean);
    return partes.join(', ');
  }
}

// Inicializar o model
Fornecedor.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nome: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [3, 100],
      },
    },
    cnpj: {
      type: DataTypes.STRING(18),
      allowNull: true,
      unique: true,
      validate: {
        is: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
      },
    },
    cpf: {
      type: DataTypes.STRING(14),
      allowNull: true,
      unique: true,
      validate: {
        is: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
      },
    },
    tipo: {
      type: DataTypes.ENUM('pf', 'pj'),
      allowNull: false,
      defaultValue: 'pj',
    },
    endereco: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    cidade: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    estado: {
      type: DataTypes.STRING(2),
      allowNull: true,
      validate: {
        len: [2, 2],
        isUppercase: true,
      },
    },
    cep: {
      type: DataTypes.STRING(10),
      allowNull: true,
      validate: {
        is: /^\d{5}-\d{3}$/,
      },
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
    banco: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    agencia: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    conta: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    pix: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    observacoes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    ativo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'fornecedores',
    timestamps: true,
    underscored: true,
    validate: {
      // Validar que PJ tem CNPJ ou PF tem CPF
      documentoObrigatorio() {
        if (this.tipo === 'pj' && !this.cnpj) {
          throw new Error('CNPJ é obrigatório para pessoa jurídica');
        }
        if (this.tipo === 'pf' && !this.cpf) {
          throw new Error('CPF é obrigatório para pessoa física');
        }
      },
    },
  }
);

export default Fornecedor;
