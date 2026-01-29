import { Request, Response } from 'express';
import { User } from '../models';
import { generateToken, generateRefreshToken } from '../utils/jwt';

// Login
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, senha } = req.body;

    // Validar campos
    if (!email || !senha) {
      res.status(400).json({
        status: 'error',
        message: 'Email e senha são obrigatórios',
      });
      return;
    }

    // Buscar usuário
    const user = await User.findOne({ where: { email } });

    if (!user) {
      res.status(401).json({
        status: 'error',
        message: 'Credenciais inválidas',
      });
      return;
    }

    // Verificar se está ativo
    if (!user.ativo) {
      res.status(403).json({
        status: 'error',
        message: 'Usuário desativado',
      });
      return;
    }

    // Verificar senha
    const senhaValida = await user.verificarSenha(senha);

    if (!senhaValida) {
      res.status(401).json({
        status: 'error',
        message: 'Credenciais inválidas',
      });
      return;
    }

    // Atualizar último acesso
    user.ultimo_acesso = new Date();
    await user.save();

    // Gerar tokens
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    res.status(200).json({
      status: 'success',
      message: 'Login realizado com sucesso',
      data: {
        user: {
          id: user.id,
          nome: user.nome,
          email: user.email,
          role: user.role,
        },
        token,
        refreshToken,
      },
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro ao realizar login',
    });
  }
};

// Registro (apenas admin pode criar usuários)
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nome, email, senha, role } = req.body;

    // Validar campos obrigatórios
    if (!nome || !email || !senha) {
      res.status(400).json({
        status: 'error',
        message: 'Nome, email e senha são obrigatórios',
      });
      return;
    }

    // Verificar se email já existe
    const userExistente = await User.findOne({ where: { email } });

    if (userExistente) {
      res.status(409).json({
        status: 'error',
        message: 'Email já cadastrado',
      });
      return;
    }

    // Criar usuário
    const novoUser = await User.create({
      nome,
      email,
      senha,
      role: role || 'user',
      ativo: true,
    });

    res.status(201).json({
      status: 'success',
      message: 'Usuário criado com sucesso',
      data: {
        user: {
          id: novoUser.id,
          nome: novoUser.nome,
          email: novoUser.email,
          role: novoUser.role,
        },
      },
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro ao criar usuário',
    });
  }
};

// Renovar token
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({
        status: 'error',
        message: 'Refresh token é obrigatório',
      });
      return;
    }

    // Verificar refresh token seria feito aqui
    // Por simplicidade, vamos apenas retornar erro por enquanto
    res.status(501).json({
      status: 'error',
      message: 'Funcionalidade não implementada',
    });
  } catch (error) {
    console.error('Erro ao renovar token:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro ao renovar token',
    });
  }
};

// Get perfil do usuário logado
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    // O usuário já foi injetado pelo middleware de autenticação
    const userId = (req as any).user?.id;

    if (!userId) {
      res.status(401).json({
        status: 'error',
        message: 'Não autenticado',
      });
      return;
    }

    const user = await User.findByPk(userId, {
      attributes: { exclude: ['senha'] },
    });

    if (!user) {
      res.status(404).json({
        status: 'error',
        message: 'Usuário não encontrado',
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: { user },
    });
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro ao buscar perfil',
    });
  }
};
