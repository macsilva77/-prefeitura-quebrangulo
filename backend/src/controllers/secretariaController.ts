import { Request, Response } from 'express';
import { Secretaria } from '../models';
import { Op } from 'sequelize';

// Listar todas as secretarias
export const getAll = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, search, ativo } = req.query;

    const offset = (Number(page) - 1) * Number(limit);
    const where: any = {};

    // Filtro de busca
    if (search) {
      where[Op.or] = [
        { nome: { [Op.iLike]: `%${search}%` } },
        { codigo: { [Op.iLike]: `%${search}%` } },
        { responsavel: { [Op.iLike]: `%${search}%` } },
      ];
    }

    // Filtro por ativo
    if (ativo !== undefined) {
      where.ativo = ativo === 'true';
    }

    const { count, rows: secretarias } = await Secretaria.findAndCountAll({
      where,
      limit: Number(limit),
      offset,
      order: [['nome', 'ASC']],
    });

    res.status(200).json({
      status: 'success',
      data: {
        secretarias,
        pagination: {
          total: count,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(count / Number(limit)),
        },
      },
    });
  } catch (error) {
    console.error('Erro ao listar secretarias:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro ao listar secretarias',
    });
  }
};

// Buscar secretaria por ID
export const getById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const secretaria = await Secretaria.findByPk(parseInt(id as string));

    if (!secretaria) {
      res.status(404).json({
        status: 'error',
        message: 'Secretaria não encontrada',
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: { secretaria },
    });
  } catch (error) {
    console.error('Erro ao buscar secretaria:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro ao buscar secretaria',
    });
  }
};

// Criar secretaria
export const create = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      nome,
      codigo,
      descricao,
      orcamento_total,
      responsavel,
      telefone,
      email,
    } = req.body;

    // Validar campos obrigatórios
    if (!nome || !orcamento_total) {
      res.status(400).json({
        status: 'error',
        message: 'Nome e orçamento total são obrigatórios',
      });
      return;
    }

    // Verificar se nome já existe
    const nomeExiste = await Secretaria.findOne({ where: { nome } });
    if (nomeExiste) {
      res.status(409).json({
        status: 'error',
        message: 'Já existe uma secretaria com este nome',
      });
      return;
    }

    // Verificar se código já existe (se fornecido)
    if (codigo) {
      const codigoExiste = await Secretaria.findOne({ where: { codigo } });
      if (codigoExiste) {
        res.status(409).json({
          status: 'error',
          message: 'Já existe uma secretaria com este código',
        });
        return;
      }
    }

    // Criar secretaria
    const secretaria = await Secretaria.create({
      nome,
      codigo,
      descricao,
      orcamento_total,
      orcamento_utilizado: 0,
      responsavel,
      telefone,
      email,
      ativo: true,
    });

    res.status(201).json({
      status: 'success',
      message: 'Secretaria criada com sucesso',
      data: { secretaria },
    });
  } catch (error) {
    console.error('Erro ao criar secretaria:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro ao criar secretaria',
    });
  }
};

// Atualizar secretaria
export const update = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      nome,
      codigo,
      descricao,
      orcamento_total,
      responsavel,
      telefone,
      email,
      ativo,
    } = req.body;

    const secretaria = await Secretaria.findByPk(parseInt(id as string));

    if (!secretaria) {
      res.status(404).json({
        status: 'error',
        message: 'Secretaria não encontrada',
      });
      return;
    }

    // Verificar se nome já existe (se mudou)
    if (nome && nome !== secretaria.nome) {
      const nomeExiste = await Secretaria.findOne({ where: { nome } });
      if (nomeExiste) {
        res.status(409).json({
          status: 'error',
          message: 'Já existe uma secretaria com este nome',
        });
        return;
      }
    }

    // Verificar se código já existe (se mudou)
    if (codigo && codigo !== secretaria.codigo) {
      const codigoExiste = await Secretaria.findOne({ where: { codigo } });
      if (codigoExiste) {
        res.status(409).json({
          status: 'error',
          message: 'Já existe uma secretaria com este código',
        });
        return;
      }
    }

    // Atualizar
    await secretaria.update({
      nome: nome || secretaria.nome,
      codigo: codigo !== undefined ? codigo : secretaria.codigo,
      descricao: descricao !== undefined ? descricao : secretaria.descricao,
      orcamento_total: orcamento_total || secretaria.orcamento_total,
      responsavel: responsavel !== undefined ? responsavel : secretaria.responsavel,
      telefone: telefone !== undefined ? telefone : secretaria.telefone,
      email: email !== undefined ? email : secretaria.email,
      ativo: ativo !== undefined ? ativo : secretaria.ativo,
    });

    res.status(200).json({
      status: 'success',
      message: 'Secretaria atualizada com sucesso',
      data: { secretaria },
    });
  } catch (error) {
    console.error('Erro ao atualizar secretaria:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro ao atualizar secretaria',
    });
  }
};

// Deletar secretaria
export const deleteSecretaria = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const secretaria = await Secretaria.findByPk(parseInt(id as string));

    if (!secretaria) {
      res.status(404).json({
        status: 'error',
        message: 'Secretaria não encontrada',
      });
      return;
    }

    // Soft delete - apenas desativa
    await secretaria.update({ ativo: false });

    res.status(200).json({
      status: 'success',
      message: 'Secretaria desativada com sucesso',
    });
  } catch (error) {
    console.error('Erro ao deletar secretaria:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro ao deletar secretaria',
    });
  }
};

// Obter estatísticas da secretaria
export const getStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const secretaria = await Secretaria.findByPk(parseInt(id as string));

    if (!secretaria) {
      res.status(404).json({
        status: 'error',
        message: 'Secretaria não encontrada',
      });
      return;
    }

    const stats = {
      orcamento_total: secretaria.orcamento_total,
      orcamento_utilizado: secretaria.orcamento_utilizado,
      orcamento_disponivel: secretaria.getOrcamentoDisponivel(),
      percentual_utilizado: secretaria.getPercentualUtilizado(),
    };

    res.status(200).json({
      status: 'success',
      data: { stats },
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro ao buscar estatísticas',
    });
  }
};
