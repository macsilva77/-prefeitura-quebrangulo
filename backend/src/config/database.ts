import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Configuração do banco de dados
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'prefeitura_quebrangulo',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true
  }
});

// Função para testar a conexão
export const connectDatabase = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexão com o banco de dados estabelecida com sucesso!');
    
    // Importar models aqui para evitar referência circular
    await import('../models');
    
    // Sincronizar modelos (apenas em desenvolvimento)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('📊 Modelos sincronizados com o banco de dados');
    }
  } catch (error) {
    console.warn('⚠️  Aviso: Não foi possível conectar ao banco de dados');
    console.warn('   Verifique se o PostgreSQL está rodando em:', process.env.DB_HOST + ':' + process.env.DB_PORT);
    console.warn('   O servidor continuará rodando sem banco de dados.');
  }
};

// Função para fechar a conexão
export const disconnectDatabase = async (): Promise<void> => {
  try {
    await sequelize.close();
    console.log('🔌 Conexão com o banco de dados fechada');
  } catch (error) {
    console.error('❌ Erro ao fechar conexão com o banco de dados:', error);
    throw error;
  }
};

export default sequelize;
