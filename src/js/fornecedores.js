/**
 * fornecedores.js - Gerenciamento de fornecedores
 * CRUD completo para fornecedores
 */

let fornecedores = JSON.parse(localStorage.getItem('prefeitura_fornecedores')) || [
    {
        id: 1,
        nome: "Supermercado Central",
        cnpj: "12.345.678/0001-90",
        email: "contato@supercentral.com.br",
        telefone: "(82) 3301-1234",
        endereco: "Av. Principal, 100 - Quebrangulo/AL",
        banco: "Banco do Brasil",
        conta: "12345-6",
        agencia: "0001",
        ativo: true,
        dataCadastro: new Date().toISOString()
    },
    {
        id: 2,
        nome: "Combustível São João",
        cnpj: "98.765.432/0001-10",
        email: "vendas@sjcombustivel.com.br",
        telefone: "(82) 3301-5678",
        endereco: "Rua das Flores, 250 - Quebrangulo/AL",
        banco: "Caixa Econômica",
        conta: "98765-4",
        agencia: "0002",
        ativo: true,
        dataCadastro: new Date().toISOString()
    }
];

/**
 * Lista todos os fornecedores
 */
function listarFornecedores(filtroAtivo = true) {
    if (filtroAtivo) {
        return fornecedores.filter(f => f.ativo);
    }
    return fornecedores;
}

/**
 * Obtém fornecedor por ID
 */
function obterFornecedor(id) {
    return fornecedores.find(f => f.id === id);
}

/**
 * Cria novo fornecedor
 */
function criarFornecedor(dados) {
    if (!temPermissao('criar')) {
        return { sucesso: false, mensagem: "Acesso negado" };
    }
    
    // Validações
    if (!dados.nome || !dados.cnpj || !dados.email) {
        return { sucesso: false, mensagem: "Preencha todos os campos obrigatórios" };
    }
    
    if (fornecedores.some(f => f.cnpj === dados.cnpj)) {
        return { sucesso: false, mensagem: "CNPJ já cadastrado" };
    }
    
    const novoFornecedor = {
        id: Math.max(...fornecedores.map(f => f.id), 0) + 1,
        nome: dados.nome,
        cnpj: dados.cnpj,
        email: dados.email,
        telefone: dados.telefone || "",
        endereco: dados.endereco || "",
        banco: dados.banco || "",
        conta: dados.conta || "",
        agencia: dados.agencia || "",
        ativo: true,
        dataCadastro: new Date().toISOString()
    };
    
    fornecedores.push(novoFornecedor);
    localStorage.setItem('prefeitura_fornecedores', JSON.stringify(fornecedores));
    
    return { sucesso: true, fornecedor: novoFornecedor, mensagem: "Fornecedor criado com sucesso" };
}

/**
 * Atualiza fornecedor
 */
function atualizarFornecedor(id, dados) {
    if (!temPermissao('editar')) {
        return { sucesso: false, mensagem: "Acesso negado" };
    }
    
    const fornecedor = fornecedores.find(f => f.id === id);
    if (!fornecedor) {
        return { sucesso: false, mensagem: "Fornecedor não encontrado" };
    }
    
    // Atualizar apenas campos permitidos
    Object.assign(fornecedor, {
        nome: dados.nome || fornecedor.nome,
        email: dados.email || fornecedor.email,
        telefone: dados.telefone || fornecedor.telefone,
        endereco: dados.endereco || fornecedor.endereco,
        banco: dados.banco || fornecedor.banco,
        conta: dados.conta || fornecedor.conta,
        agencia: dados.agencia || fornecedor.agencia
    });
    
    localStorage.setItem('prefeitura_fornecedores', JSON.stringify(fornecedores));
    
    return { sucesso: true, fornecedor, mensagem: "Fornecedor atualizado com sucesso" };
}

/**
 * Desativa fornecedor (soft delete)
 */
function desativarFornecedor(id) {
    if (!temPermissao('deletar')) {
        return { sucesso: false, mensagem: "Acesso negado" };
    }
    
    const fornecedor = fornecedores.find(f => f.id === id);
    if (!fornecedor) {
        return { sucesso: false, mensagem: "Fornecedor não encontrado" };
    }
    
    fornecedor.ativo = false;
    localStorage.setItem('prefeitura_fornecedores', JSON.stringify(fornecedores));
    
    return { sucesso: true, mensagem: "Fornecedor desativado com sucesso" };
}

/**
 * Ativa fornecedor
 */
function ativarFornecedor(id) {
    if (!temPermissao('editar')) {
        return { sucesso: false, mensagem: "Acesso negado" };
    }
    
    const fornecedor = fornecedores.find(f => f.id === id);
    if (!fornecedor) {
        return { sucesso: false, mensagem: "Fornecedor não encontrado" };
    }
    
    fornecedor.ativo = true;
    localStorage.setItem('prefeitura_fornecedores', JSON.stringify(fornecedores));
    
    return { sucesso: true, mensagem: "Fornecedor ativado com sucesso" };
}

/**
 * Busca fornecedores por termo
 */
function buscarFornecedores(termo) {
    return fornecedores.filter(f => 
        f.ativo && (
            f.nome.toLowerCase().includes(termo.toLowerCase()) ||
            f.cnpj.includes(termo) ||
            f.email.toLowerCase().includes(termo.toLowerCase())
        )
    );
}
