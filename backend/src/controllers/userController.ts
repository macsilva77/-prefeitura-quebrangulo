import { Request, Response } from 'express';
import { User } from '../models';
import { Op } from 'sequelize';

// Listar todos os usuários
export const getAll = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, search, role, ativo } = req.query;

    const offset = (Number(page) - 1) * Number(limit);
    const where: any = {};

    // Filtro de busca
    if (search) {
      where[Op.or] = [
        { nome: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
      ];
    }

    // Filtro por role
    if (role) {
      where.role = role;
    }

    // Filtro por ativo
    if (ativo !== undefined) {
      where.ativo = ativo === 'true';
    }

    const { count, rows: users } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['senha'] },
      limit: Number(limit),
      offset,
      order: [['created_at', 'DESC']],
    });

    res.status(200).json({
      status: 'success',
      data: {
        users,
        pagination: {
          total: count,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(count / Number(limit)),
        },
      },
    });
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro ao listar usuários',
    });
  }
};

// Buscar usuário por ID
export const getById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(parseInt(id as string), {
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
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro ao buscar usuário',
    });
  }
};

// Atualizar usuário
export const update = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { nome, email, role, ativo } = req.body;

    const user = await User.findByPk(parseInt(id as string));

    if (!user) {
      res.status(404).json({
        status: 'error',
        message: 'Usuário não encontrado',
      });
      return;
    }

    // Verificar se email já existe (se mudou)
    if (email && email !== user.email) {
      const emailExiste = await User.findOne({ where: { email } });
      if (emailExiste) {
        res.status(409).json({
          status: 'error',
          message: 'Email já cadastrado',
        });
        return;
      }
    }

    // Atualizar
    await user.update({
      nome: nome || user.nome,
      email: email || user.email,
      role: role || user.role,
      ativo: ativo !== undefined ? ativo : user.ativo,
    });

    res.status(200).json({
      status: 'success',
      message: 'Usuário atualizado com sucesso',
      data: {
        user: {
          id: user.id,
          nome: user.nome,
          email: user.email,
          role: user.role,
          ativo: user.ativo,
        },
      },
    });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro ao atualizar usuário',
    });
  }
};

// Atualizar senha
export const updatePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { senhaAtual, novaSenha } = req.body;

    if (!senhaAtual || !novaSenha) {
      res.status(400).json({
        status: 'error',
        message: 'Senha atual e nova senha são obrigatórias',
      });
      return;
    }

    const user = await User.findByPk(parseInt(id as string));

    if (!user) {
      res.status(404).json({
        status: 'error',
        message: 'Usuário não encontrado',
      });
      return;
    }

    // Verificar senha atual
    const senhaValida = await user.verificarSenha(senhaAtual);

    if (!senhaValida) {
      res.status(401).json({
        status: 'error',
        message: 'Senha atual incorreta',
      });
      return;
    }

    // Atualizar senha
    user.senha = novaSenha;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Senha atualizada com sucesso',
    });
  } catch (error) {
    console.error('Erro ao atualizar senha:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro ao atualizar senha',
    });
  }
};

// Deletar usuário
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(parseInt(id as string));

    if (!user) {
      res.status(404).json({
        status: 'error',
        message: 'Usuário não encontrado',
      });
      return;
    }

    // Soft delete - apenas desativa
    await user.update({ ativo: false });

    res.status(200).json({
      status: 'success',
      message: 'Usuário desativado com sucesso',
    });
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro ao deletar usuário',
    });
  }
};
