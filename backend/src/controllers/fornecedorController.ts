import { Request, Response } from 'express';
import { Fornecedor } from '../models';
import { Op } from 'sequelize';

// Listar todos os fornecedores
export const getAll = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, search, tipo, ativo } = req.query;

    const offset = (Number(page) - 1) * Number(limit);
    const where: any = {};

    // Filtro de busca
    if (search) {
      where[Op.or] = [
        { nome: { [Op.iLike]: `%${search}%` } },
        { cnpj: { [Op.iLike]: `%${search}%` } },
        { cpf: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
      ];
    }

    // Filtro por tipo (PF ou PJ)
    if (tipo) {
      where.tipo = tipo;
    }

    // Filtro por ativo
    if (ativo !== undefined) {
      where.ativo = ativo === 'true';
    }

    const { count, rows: fornecedores } = await Fornecedor.findAndCountAll({
      where,
      limit: Number(limit),
      offset,
      order: [['nome', 'ASC']],
    });

    res.status(200).json({
      status: 'success',
      data: {
        fornecedores,
        pagination: {
          total: count,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(count / Number(limit)),
        },
      },
    });
  } catch (error) {
    console.error('Erro ao listar fornecedores:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro ao listar fornecedores',
    });
  }
};

// Buscar fornecedor por ID
export const getById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const fornecedor = await Fornecedor.findByPk(parseInt(id as string));

    if (!fornecedor) {
      res.status(404).json({
        status: 'error',
        message: 'Fornecedor não encontrado',
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: { fornecedor },
    });
  } catch (error) {
    console.error('Erro ao buscar fornecedor:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro ao buscar fornecedor',
    });
  }
};

// Criar fornecedor
export const create = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      nome,
      cnpj,
      cpf,
      tipo,
      endereco,
      cidade,
      estado,
      cep,
      telefone,
      email,
      banco,
      agencia,
      conta,
      pix,
      observacoes,
    } = req.body;

    // Validar campos obrigatórios
    if (!nome || !tipo) {
      res.status(400).json({
        status: 'error',
        message: 'Nome e tipo são obrigatórios',
      });
      return;
    }

    // Validar documento conforme tipo
    if (tipo === 'pj' && !cnpj) {
      res.status(400).json({
        status: 'error',
        message: 'CNPJ é obrigatório para pessoa jurídica',
      });
      return;
    }

    if (tipo === 'pf' && !cpf) {
      res.status(400).json({
        status: 'error',
        message: 'CPF é obrigatório para pessoa física',
      });
      return;
    }

    // Verificar se CNPJ já existe
    if (cnpj) {
      const cnpjExiste = await Fornecedor.findOne({ where: { cnpj } });
      if (cnpjExiste) {
        res.status(409).json({
          status: 'error',
          message: 'CNPJ já cadastrado',
        });
        return;
      }
    }

    // Verificar se CPF já existe
    if (cpf) {
      const cpfExiste = await Fornecedor.findOne({ where: { cpf } });
      if (cpfExiste) {
        res.status(409).json({
          status: 'error',
          message: 'CPF já cadastrado',
        });
        return;
      }
    }

    // Criar fornecedor
    const fornecedor = await Fornecedor.create({
      nome,
      cnpj,
      cpf,
      tipo,
      endereco,
      cidade,
      estado,
      cep,
      telefone,
      email,
      banco,
      agencia,
      conta,
      pix,
      observacoes,
      ativo: true,
    });

    res.status(201).json({
      status: 'success',
      message: 'Fornecedor criado com sucesso',
      data: { fornecedor },
    });
  } catch (error: any) {
    console.error('Erro ao criar fornecedor:', error);
    
    // Tratar erro de validação do Sequelize
    if (error.name === 'SequelizeValidationError') {
      res.status(400).json({
        status: 'error',
        message: error.errors[0].message,
      });
      return;
    }

    res.status(500).json({
      status: 'error',
      message: 'Erro ao criar fornecedor',
    });
  }
};

// Atualizar fornecedor
export const update = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const fornecedor = await Fornecedor.findByPk(parseInt(id as string));

    if (!fornecedor) {
      res.status(404).json({
        status: 'error',
        message: 'Fornecedor não encontrado',
      });
      return;
    }

    // Verificar se CNPJ já existe (se mudou)
    if (updateData.cnpj && updateData.cnpj !== fornecedor.cnpj) {
      const cnpjExiste = await Fornecedor.findOne({ 
        where: { cnpj: updateData.cnpj } 
      });
      if (cnpjExiste) {
        res.status(409).json({
          status: 'error',
          message: 'CNPJ já cadastrado',
        });
        return;
      }
    }

    // Verificar se CPF já existe (se mudou)
    if (updateData.cpf && updateData.cpf !== fornecedor.cpf) {
      const cpfExiste = await Fornecedor.findOne({ 
        where: { cpf: updateData.cpf } 
      });
      if (cpfExiste) {
        res.status(409).json({
          status: 'error',
          message: 'CPF já cadastrado',
        });
        return;
      }
    }

    // Atualizar
    await fornecedor.update(updateData);

    res.status(200).json({
      status: 'success',
      message: 'Fornecedor atualizado com sucesso',
      data: { fornecedor },
    });
  } catch (error: any) {
    console.error('Erro ao atualizar fornecedor:', error);
    
    if (error.name === 'SequelizeValidationError') {
      res.status(400).json({
        status: 'error',
        message: error.errors[0].message,
      });
      return;
    }

    res.status(500).json({
      status: 'error',
      message: 'Erro ao atualizar fornecedor',
    });
  }
};

// Deletar fornecedor
export const deleteFornecedor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const fornecedor = await Fornecedor.findByPk(parseInt(id as string));

    if (!fornecedor) {
      res.status(404).json({
        status: 'error',
        message: 'Fornecedor não encontrado',
      });
      return;
    }

    // Soft delete - apenas desativa
    await fornecedor.update({ ativo: false });

    res.status(200).json({
      status: 'success',
      message: 'Fornecedor desativado com sucesso',
    });
  } catch (error) {
    console.error('Erro ao deletar fornecedor:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro ao deletar fornecedor',
    });
  }
};
