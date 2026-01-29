import dotenv from 'dotenv';
import { connectDatabase } from '../config/database';
import { User } from '../models';

dotenv.config();

async function criarUsuarioAdmin() {
  try {
    // Conectar ao banco
    await connectDatabase();

    // Verificar se já existe um admin
    const adminExistente = await User.findOne({
      where: { email: 'admin@prefeitura.gov.br' },
    });

    if (adminExistente) {
      console.log('⚠️  Usuário admin já existe!');
      console.log('Email:', adminExistente.email);
      process.exit(0);
    }

    // Criar usuário admin
    const admin = await User.create({
      nome: 'Administrador',
      email: 'admin@prefeitura.gov.br',
      senha: 'admin123',
      role: 'admin',
      ativo: true,
    });

    console.log('✅ Usuário admin criado com sucesso!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Email:', admin.email);
    console.log('Senha: admin123');
    console.log('Role:', admin.role);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⚠️  IMPORTANTE: Altere a senha após o primeiro login!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao criar usuário admin:', error);
    process.exit(1);
  }
}

criarUsuarioAdmin();
