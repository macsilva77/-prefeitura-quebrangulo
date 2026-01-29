import { Request, Response } from 'express';
import { Verba, Secretaria, Fornecedor, User } from '../models';
import { Op } from 'sequelize';

// Listar todas as verbas
export const getAll = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      secretaria_id,
      fornecedor_id,
      status,
      tipo,
      data_inicio,
      data_fim,
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);
    const where: any = {};

    // Filtro de busca
    if (search) {
      where[Op.or] = [
        { descricao: { [Op.iLike]: `%${search}%` } },
        { numero_nota: { [Op.iLike]: `%${search}%` } },
        { categoria: { [Op.iLike]: `%${search}%` } },
      ];
    }

    // Filtros específicos
    if (secretaria_id) where.secretaria_id = secretaria_id;
    if (fornecedor_id) where.fornecedor_id = fornecedor_id;
    if (status) where.status = status;
    if (tipo) where.tipo = tipo;

    // Filtro por período
    if (data_inicio || data_fim) {
      where.data_emissao = {};
      if (data_inicio) where.data_emissao[Op.gte] = new Date(data_inicio as string);
      if (data_fim) where.data_emissao[Op.lte] = new Date(data_fim as string);
    }

    const { count, rows: verbas } = await Verba.findAndCountAll({
      where,
      include: [
        {
          model: Secretaria,
          as: 'secretaria',
          attributes: ['id', 'nome', 'codigo'],
        },
        {
          model: Fornecedor,
          as: 'fornecedor',
          attributes: ['id', 'nome', 'cnpj', 'cpf', 'tipo'],
        },
        {
          model: User,
          as: 'usuario',
          attributes: ['id', 'nome', 'email'],
        },
      ],
      limit: Number(limit),
      offset,
      order: [['data_emissao', 'DESC']],
    });

    res.status(200).json({
      status: 'success',
      data: {
        verbas,
        pagination: {
          total: count,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(count / Number(limit)),
        },
      },
    });
  } catch (error) {
    console.error('Erro ao listar verbas:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro ao listar verbas',
    });
  }
};

// Buscar verba por ID
export const getById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const verba = await Verba.findByPk(parseInt(id as string), {
      include: [
        {
          model: Secretaria,
          as: 'secretaria',
        },
        {
          model: Fornecedor,
          as: 'fornecedor',
        },
        {
          model: User,
          as: 'usuario',
          attributes: ['id', 'nome', 'email'],
        },
      ],
    });

    if (!verba) {
      res.status(404).json({
        status: 'error',
        message: 'Verba não encontrada',
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: { verba },
    });
  } catch (error) {
    console.error('Erro ao buscar verba:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro ao buscar verba',
    });
  }
};

// Criar verba
export const create = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      secretaria_id,
      fornecedor_id,
      descricao,
      valor,
      data_emissao,
      data_vencimento,
      numero_nota,
      categoria,
      tipo,
      observacoes,
    } = req.body;

    // Usuário vem do middleware de autenticação
    const user_id = (req as any).user?.id;

    if (!user_id) {
      res.status(401).json({
        status: 'error',
        message: 'Usuário não autenticado',
      });
      return;
    }

    // Validar campos obrigatórios
    if (!secretaria_id || !fornecedor_id || !descricao || !valor || !categoria) {
      res.status(400).json({
        status: 'error',
        message: 'Campos obrigatórios: secretaria, fornecedor, descrição, valor, categoria',
      });
      return;
    }

    // Verificar se secretaria existe
    const secretaria = await Secretaria.findByPk(secretaria_id);
    if (!secretaria) {
      res.status(404).json({
        status: 'error',
        message: 'Secretaria não encontrada',
      });
      return;
    }

    // Verificar se fornecedor existe
    const fornecedor = await Fornecedor.findByPk(fornecedor_id);
    if (!fornecedor) {
      res.status(404).json({
        status: 'error',
        message: 'Fornecedor não encontrado',
      });
      return;
    }

    // Verificar se há orçamento disponível
    const orcamentoDisponivel = secretaria.getOrcamentoDisponivel();
    if (valor > orcamentoDisponivel) {
      res.status(400).json({
        status: 'error',
        message: `Orçamento insuficiente. Disponível: R$ ${orcamentoDisponivel}`,
      });
      return;
    }

    // Criar verba
    const verba = await Verba.create({
      secretaria_id,
      fornecedor_id,
      user_id,
      descricao,
      valor,
      data_emissao: data_emissao || new Date(),
      data_vencimento,
      numero_nota,
      categoria,
      tipo: tipo || 'empenho',
      status: 'pendente',
      observacoes,
    });

    // Atualizar orçamento utilizado da secretaria
    await secretaria.update({
      orcamento_utilizado: Number(secretaria.orcamento_utilizado) + Number(valor),
    });

    // Buscar verba com relacionamentos
    const verbaCompleta = await Verba.findByPk(verba.id, {
      include: [
        { model: Secretaria, as: 'secretaria' },
        { model: Fornecedor, as: 'fornecedor' },
        { model: User, as: 'usuario', attributes: ['id', 'nome', 'email'] },
      ],
    });

    res.status(201).json({
      status: 'success',
      message: 'Verba criada com sucesso',
      data: { verba: verbaCompleta },
    });
  } catch (error) {
    console.error('Erro ao criar verba:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro ao criar verba',
    });
  }
};

// Atualizar verba
export const update = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const verba = await Verba.findByPk(parseInt(id as string));

    if (!verba) {
      res.status(404).json({
        status: 'error',
        message: 'Verba não encontrada',
      });
      return;
    }

    // Não permitir alterar se já foi paga
    if (verba.status === 'pago') {
      res.status(400).json({
        status: 'error',
        message: 'Não é possível alterar uma verba já paga',
      });
      return;
    }

    // Se alterar o valor, recalcular orçamento da secretaria
    if (updateData.valor && updateData.valor !== verba.valor) {
      const secretaria = await Secretaria.findByPk(verba.secretaria_id);
      if (secretaria) {
        const diferenca = Number(updateData.valor) - Number(verba.valor);
        const novoOrcamentoUtilizado = Number(secretaria.orcamento_utilizado) + diferenca;

        if (novoOrcamentoUtilizado > secretaria.orcamento_total) {
          res.status(400).json({
            status: 'error',
            message: 'Orçamento insuficiente para esta alteração',
          });
          return;
        }

        await secretaria.update({
          orcamento_utilizado: novoOrcamentoUtilizado,
        });
      }
    }

    // Atualizar verba
    await verba.update(updateData);

    // Buscar verba atualizada com relacionamentos
    const verbaAtualizada = await Verba.findByPk(parseInt(id as string), {
      include: [
        { model: Secretaria, as: 'secretaria' },
        { model: Fornecedor, as: 'fornecedor' },
        { model: User, as: 'usuario', attributes: ['id', 'nome', 'email'] },
      ],
    });

    res.status(200).json({
      status: 'success',
      message: 'Verba atualizada com sucesso',
      data: { verba: verbaAtualizada },
    });
  } catch (error) {
    console.error('Erro ao atualizar verba:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro ao atualizar verba',
    });
  }
};

// Aprovar verba
export const aprovar = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const verba = await Verba.findByPk(parseInt(id as string));

    if (!verba) {
      res.status(404).json({
        status: 'error',
        message: 'Verba não encontrada',
      });
      return;
    }

    if (verba.status !== 'pendente') {
      res.status(400).json({
        status: 'error',
        message: 'Apenas verbas pendentes podem ser aprovadas',
      });
      return;
    }

    await verba.update({ status: 'aprovado' });

    res.status(200).json({
      status: 'success',
      message: 'Verba aprovada com sucesso',
      data: { verba },
    });
  } catch (error) {
    console.error('Erro ao aprovar verba:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro ao aprovar verba',
    });
  }
};

// Pagar verba
export const pagar = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { forma_pagamento, data_pagamento } = req.body;

    const verba = await Verba.findByPk(parseInt(id as string));

    if (!verba) {
      res.status(404).json({
        status: 'error',
        message: 'Verba não encontrada',
      });
      return;
    }

    if (!verba.podePagar()) {
      res.status(400).json({
        status: 'error',
        message: 'Apenas verbas aprovadas podem ser pagas',
      });
      return;
    }

    if (!forma_pagamento) {
      res.status(400).json({
        status: 'error',
        message: 'Forma de pagamento é obrigatória',
      });
      return;
    }

    await verba.update({
      status: 'pago',
      forma_pagamento,
      data_pagamento: data_pagamento || new Date(),
    });

    res.status(200).json({
      status: 'success',
      message: 'Pagamento registrado com sucesso',
      data: { verba },
    });
  } catch (error) {
    console.error('Erro ao pagar verba:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro ao pagar verba',
    });
  }
};

// Cancelar verba
export const cancelar = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { motivo } = req.body;

    const verba = await Verba.findByPk(parseInt(id as string));

    if (!verba) {
      res.status(404).json({
        status: 'error',
        message: 'Verba não encontrada',
      });
      return;
    }

    if (verba.status === 'pago') {
      res.status(400).json({
        status: 'error',
        message: 'Não é possível cancelar uma verba já paga',
      });
      return;
    }

    // Devolver orçamento para a secretaria
    const secretaria = await Secretaria.findByPk(verba.secretaria_id);
    if (secretaria) {
      await secretaria.update({
        orcamento_utilizado: Number(secretaria.orcamento_utilizado) - Number(verba.valor),
      });
    }

    await verba.update({
      status: 'cancelado',
      observacoes: motivo ? `CANCELADO: ${motivo}` : 'CANCELADO',
    });

    res.status(200).json({
      status: 'success',
      message: 'Verba cancelada com sucesso',
      data: { verba },
    });
  } catch (error) {
    console.error('Erro ao cancelar verba:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro ao cancelar verba',
    });
  }
};

// Obter estatísticas gerais
export const getStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const { secretaria_id, data_inicio, data_fim } = req.query;

    const where: any = {};
    if (secretaria_id) where.secretaria_id = secretaria_id;
    if (data_inicio || data_fim) {
      where.data_emissao = {};
      if (data_inicio) where.data_emissao[Op.gte] = new Date(data_inicio as string);
      if (data_fim) where.data_emissao[Op.lte] = new Date(data_fim as string);
    }

    const [totalVerbas, totalPendente, totalAprovado, totalPago, totalCancelado] = await Promise.all([
      Verba.count({ where }),
      Verba.count({ where: { ...where, status: 'pendente' } }),
      Verba.count({ where: { ...where, status: 'aprovado' } }),
      Verba.count({ where: { ...where, status: 'pago' } }),
      Verba.count({ where: { ...where, status: 'cancelado' } }),
    ]);

    const valorTotal = await Verba.sum('valor', { where });
    const valorPago = await Verba.sum('valor', { where: { ...where, status: 'pago' } });

    res.status(200).json({
      status: 'success',
      data: {
        stats: {
          total_verbas: totalVerbas,
          total_pendente: totalPendente,
          total_aprovado: totalAprovado,
          total_pago: totalPago,
          total_cancelado: totalCancelado,
          valor_total: valorTotal || 0,
          valor_pago: valorPago || 0,
          valor_pendente: (valorTotal || 0) - (valorPago || 0),
        },
      },
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro ao buscar estatísticas',
    });
  }
};
