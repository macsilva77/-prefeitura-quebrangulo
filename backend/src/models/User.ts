import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';
import bcrypt from 'bcrypt';

// Definir atributos do User
interface UserAttributes {
  id: number;
  nome: string;
  email: string;
  senha: string;
  role: 'admin' | 'user' | 'visualizador';
  ativo: boolean;
  ultimo_acesso?: Date;
  created_at?: Date;
  updated_at?: Date;
}

// Atributos opcionais para criação
interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'ativo' | 'ultimo_acesso' | 'created_at' | 'updated_at'> {}

// Classe do Model
class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public nome!: string;
  public email!: string;
  public senha!: string;
  public role!: 'admin' | 'user' | 'visualizador';
  public ativo!: boolean;
  public ultimo_acesso?: Date;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // Método para verificar senha
  public async verificarSenha(senha: string): Promise<boolean> {
    return bcrypt.compare(senha, this.senha);
  }

  // Método para hash de senha
  public static async hashSenha(senha: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(senha, salt);
  }
}

// Inicializar o model
User.init(
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
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
        notEmpty: true,
      },
    },
    senha: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    role: {
      type: DataTypes.ENUM('admin', 'user', 'visualizador'),
      allowNull: false,
      defaultValue: 'user',
    },
    ativo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    ultimo_acesso: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
    underscored: true,
    hooks: {
      // Hash senha antes de criar
      beforeCreate: async (user: User) => {
        if (user.senha) {
          user.senha = await User.hashSenha(user.senha);
        }
      },
      // Hash senha antes de atualizar se mudou
      beforeUpdate: async (user: User) => {
        if (user.changed('senha')) {
          user.senha = await User.hashSenha(user.senha);
        }
      },
    },
  }
);

export default User;
