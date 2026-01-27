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
    },
    {
        id: 3,
        nome: "Alfa Serviços",
        cnpj: "11.222.333/0001-44",
        email: "contato@alfaservicos.com.br",
        telefone: "(82) 3301-1111",
        endereco: "Rua A, 10 - Quebrangulo/AL",
        banco: "Banco do Brasil",
        conta: "111111-1",
        agencia: "0001",
        ativo: true,
        dataCadastro: new Date().toISOString()
    },
    {
        id: 4,
        nome: "MedSupply LTDA",
        cnpj: "22.333.444/0001-55",
        email: "vendas@medsupply.com.br",
        telefone: "(82) 3301-2222",
        endereco: "Rua B, 20 - Quebrangulo/AL",
        banco: "Itaú",
        conta: "222222-2",
        agencia: "0001",
        ativo: true,
        dataCadastro: new Date().toISOString()
    },
    {
        id: 5,
        nome: "Construtora Delta",
        cnpj: "33.444.555/0001-66",
        email: "contato@construtoradelta.com.br",
        telefone: "(82) 3301-3333",
        endereco: "Rua C, 30 - Quebrangulo/AL",
        banco: "Caixa",
        conta: "333333-3",
        agencia: "0001",
        ativo: true,
        dataCadastro: new Date().toISOString()
    },
    {
        id: 6,
        nome: "TechGov",
        cnpj: "44.555.666/0001-77",
        email: "vendas@techgov.com.br",
        telefone: "(82) 3301-4444",
        endereco: "Rua D, 40 - Quebrangulo/AL",
        banco: "Bradesco",
        conta: "444444-4",
        agencia: "0001",
        ativo: true,
        dataCadastro: new Date().toISOString()
    },
    {
        id: 7,
        nome: "Papelaria Nordeste",
        cnpj: "55.666.777/0001-88",
        email: "contato@papelariandeste.com.br",
        telefone: "(82) 3301-5555",
        endereco: "Rua E, 50 - Quebrangulo/AL",
        banco: "Banco do Brasil",
        conta: "555555-5",
        agencia: "0001",
        ativo: true,
        dataCadastro: new Date().toISOString()
    },
    {
        id: 8,
        nome: "Cesta Viva",
        cnpj: "66.777.888/0001-99",
        email: "vendas@cestaviva.com.br",
        telefone: "(82) 3301-6666",
        endereco: "Rua F, 60 - Quebrangulo/AL",
        banco: "Itaú",
        conta: "666666-6",
        agencia: "0001",
        ativo: true,
        dataCadastro: new Date().toISOString()
    },
    {
        id: 9,
        nome: "Som & Luz Produções",
        cnpj: "77.888.999/0001-00",
        email: "contato@someluz.com.br",
        telefone: "(82) 3301-7777",
        endereco: "Rua G, 70 - Quebrangulo/AL",
        banco: "Caixa",
        conta: "777777-7",
        agencia: "0001",
        ativo: true,
        dataCadastro: new Date().toISOString()
    },
    {
        id: 10,
        nome: "AgroTec",
        cnpj: "88.999.000/0001-11",
        email: "vendas@agrotec.com.br",
        telefone: "(82) 3301-8888",
        endereco: "Rua H, 80 - Quebrangulo/AL",
        banco: "Banco do Brasil",
        conta: "888888-8",
        agencia: "0001",
        ativo: true,
        dataCadastro: new Date().toISOString()
    },
    {
        id: 11,
        nome: "Pavimenta Brasil",
        cnpj: "99.000.111/0001-22",
        email: "contato@pavimentabrasil.com.br",
        telefone: "(82) 3301-9999",
        endereco: "Rua I, 90 - Quebrangulo/AL",
        banco: "Bradesco",
        conta: "999999-9",
        agencia: "0001",
        ativo: true,
        dataCadastro: new Date().toISOString()
    },
    {
        id: 12,
        nome: "LabVida",
        cnpj: "00.111.222/0001-33",
        email: "vendas@labvida.com.br",
        telefone: "(82) 3301-1010",
        endereco: "Rua J, 100 - Quebrangulo/AL",
        banco: "Itaú",
        conta: "101010-10",
        agencia: "0001",
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
 * Obtém fornecedor por nome
 */
function obterFornecedorPorNome(nome) {
    return fornecedores.find(f => f.nome === nome);
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
