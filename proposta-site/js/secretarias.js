/**
 * secretarias.js - Gerenciamento de secretarias
 * CRUD completo para secretarias/departamentos
 */

let secretarias = JSON.parse(localStorage.getItem('prefeitura_secretarias')) || [
    {
        id: 1,
        nome: "Educação",
        sigla: "SEC",
        descricao: "Secretaria Municipal de Educação",
        responsavel: "João Silva",
        email: "educacao@prefeitura.gov.br",
        telefone: "(82) 3301-1000",
        orcamento: 2500000,
        ativo: true,
        dataCadastro: new Date().toISOString()
    },
    {
        id: 2,
        nome: "Administração e Finanças",
        sigla: "SAF",
        descricao: "Secretaria de Administração e Finanças",
        responsavel: "Maria Santos",
        email: "financas@prefeitura.gov.br",
        telefone: "(82) 3301-1001",
        orcamento: 1800000,
        ativo: true,
        dataCadastro: new Date().toISOString()
    },
    {
        id: 3,
        nome: "Saúde",
        sigla: "SAU",
        descricao: "Secretaria Municipal de Saúde",
        responsavel: "Dr. Carlos",
        email: "saude@prefeitura.gov.br",
        telefone: "(82) 3301-1002",
        orcamento: 3000000,
        ativo: true,
        dataCadastro: new Date().toISOString()
    },
    {
        id: 4,
        nome: "Infraestrutura e Obras",
        sigla: "SIO",
        descricao: "Secretaria de Infraestrutura e Obras",
        responsavel: "Pedro Oliveira",
        email: "obras@prefeitura.gov.br",
        telefone: "(82) 3301-1003",
        orcamento: 2000000,
        ativo: true,
        dataCadastro: new Date().toISOString()
    },
    {
        id: 5,
        nome: "Assistência Social",
        sigla: "SAS",
        descricao: "Secretaria de Assistência Social",
        responsavel: "Ana Paula",
        email: "assistencia@prefeitura.gov.br",
        telefone: "(82) 3301-1004",
        orcamento: 1500000,
        ativo: true,
        dataCadastro: new Date().toISOString()
    },
    {
        id: 6,
        nome: "Turismo, Cultura e Esporte",
        sigla: "STCE",
        descricao: "Secretaria de Turismo, Cultura e Esporte",
        responsavel: "Fernando Costa",
        email: "cultura@prefeitura.gov.br",
        telefone: "(82) 3301-1005",
        orcamento: 1200000,
        ativo: true,
        dataCadastro: new Date().toISOString()
    },
    {
        id: 7,
        nome: "Agricultura",
        sigla: "SAG",
        descricao: "Secretaria de Agricultura",
        responsavel: "Raimundo Andrade",
        email: "agricultura@prefeitura.gov.br",
        telefone: "(82) 3301-1006",
        orcamento: 800000,
        ativo: true,
        dataCadastro: new Date().toISOString()
    }
];

/**
 * Lista todas as secretarias
 */
function listarSecretarias(filtroAtivo = true) {
    if (filtroAtivo) {
        return secretarias.filter(s => s.ativo);
    }
    return secretarias;
}

/**
 * Obtém secretaria por ID
 */
function obterSecretaria(id) {
    return secretarias.find(s => s.id === id);
}

/**
 * Cria nova secretaria
 */
function criarSecretaria(dados) {
    if (!temPermissao('criar')) {
        return { sucesso: false, mensagem: "Acesso negado" };
    }
    
    // Validações
    if (!dados.nome || !dados.sigla || !dados.responsavel) {
        return { sucesso: false, mensagem: "Preencha todos os campos obrigatórios" };
    }
    
    if (secretarias.some(s => s.sigla === dados.sigla)) {
        return { sucesso: false, mensagem: "Sigla já existe" };
    }
    
    const novaSecretaria = {
        id: Math.max(...secretarias.map(s => s.id), 0) + 1,
        nome: dados.nome,
        sigla: dados.sigla,
        descricao: dados.descricao || "",
        responsavel: dados.responsavel,
        email: dados.email || "",
        telefone: dados.telefone || "",
        orcamento: dados.orcamento || 0,
        ativo: true,
        dataCadastro: new Date().toISOString()
    };
    
    secretarias.push(novaSecretaria);
    localStorage.setItem('prefeitura_secretarias', JSON.stringify(secretarias));
    
    return { sucesso: true, secretaria: novaSecretaria, mensagem: "Secretaria criada com sucesso" };
}

/**
 * Atualiza secretaria
 */
function atualizarSecretaria(id, dados) {
    if (!temPermissao('editar')) {
        return { sucesso: false, mensagem: "Acesso negado" };
    }
    
    const secretaria = secretarias.find(s => s.id === id);
    if (!secretaria) {
        return { sucesso: false, mensagem: "Secretaria não encontrada" };
    }
    
    // Atualizar campos
    Object.assign(secretaria, {
        nome: dados.nome || secretaria.nome,
        descricao: dados.descricao !== undefined ? dados.descricao : secretaria.descricao,
        responsavel: dados.responsavel || secretaria.responsavel,
        email: dados.email || secretaria.email,
        telefone: dados.telefone || secretaria.telefone,
        orcamento: dados.orcamento || secretaria.orcamento
    });
    
    localStorage.setItem('prefeitura_secretarias', JSON.stringify(secretarias));
    
    return { sucesso: true, secretaria, mensagem: "Secretaria atualizada com sucesso" };
}

/**
 * Desativa secretaria
 */
function desativarSecretaria(id) {
    if (!temPermissao('deletar')) {
        return { sucesso: false, mensagem: "Acesso negado" };
    }
    
    const secretaria = secretarias.find(s => s.id === id);
    if (!secretaria) {
        return { sucesso: false, mensagem: "Secretaria não encontrada" };
    }
    
    secretaria.ativo = false;
    localStorage.setItem('prefeitura_secretarias', JSON.stringify(secretarias));
    
    return { sucesso: true, mensagem: "Secretaria desativada com sucesso" };
}

/**
 * Ativa secretaria
 */
function ativarSecretaria(id) {
    if (!temPermissao('editar')) {
        return { sucesso: false, mensagem: "Acesso negado" };
    }
    
    const secretaria = secretarias.find(s => s.id === id);
    if (!secretaria) {
        return { sucesso: false, mensagem: "Secretaria não encontrada" };
    }
    
    secretaria.ativo = true;
    localStorage.setItem('prefeitura_secretarias', JSON.stringify(secretarias));
    
    return { sucesso: true, mensagem: "Secretaria ativada com sucesso" };
}

/**
 * Busca secretarias por termo
 */
function buscarSecretarias(termo) {
    return secretarias.filter(s => 
        s.ativo && (
            s.nome.toLowerCase().includes(termo.toLowerCase()) ||
            s.sigla.toLowerCase().includes(termo.toLowerCase()) ||
            s.responsavel.toLowerCase().includes(termo.toLowerCase())
        )
    );
}
