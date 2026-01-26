/**
 * auth.js - Gerenciamento de autenticação
 * Controla login, registro e sessão de usuários
 */

// Usuários cadastrados (em produção, seria em banco de dados)
let users = JSON.parse(localStorage.getItem('prefeitura_users')) || [
    {
        id: 1,
        nome: "Administrador",
        email: "admin@prefeitura.gov.br",
        senhaHash: typeof hashPassword !== 'undefined' ? hashPassword("Admin123") : "sha256:d8e8fca2dc0f896fd7cb4cb0031ba249", // Fallback se crypto.js não carregou
        role: "admin",
        ativo: true,
        dataCriacao: new Date().toISOString()
    }
];

// Usuário autenticado atual
let usuarioAtual = JSON.parse(localStorage.getItem('prefeitura_usuario_atual')) || null;

console.log('✓ auth.js carregado', { users, usuarioAtual });

/**
 * Realiza login do usuário
 */
function login(email, senha) {
    // Sanitiza inputs
    email = sanitizeInput(email.toLowerCase());
    
    const user = users.find(u => u.email === email && u.ativo);
    
    if (!user) {
        // Log de tentativa de login falha (auditoria)
        logAudit('LOGIN_FALHOU', { email, timestamp: new Date().toISOString() });
        return { sucesso: false, mensagem: "Email ou senha inválidos" };
    }
    
    // Verifica senha
    if (hashPassword(senha) !== user.senhaHash) {
        logAudit('LOGIN_FALHOU', { email, timestamp: new Date().toISOString() });
        return { sucesso: false, mensagem: "Email ou senha inválidos" };
    }
    
    usuarioAtual = { ...user };
    delete usuarioAtual.senhaHash; // Nunca armazenar hash
    
    localStorage.setItem('prefeitura_usuario_atual', JSON.stringify(usuarioAtual));
    
    // Log de login bem-sucedido
    logAudit('LOGIN_SUCESSO', { email, role: user.role, timestamp: new Date().toISOString() });
    
    return { sucesso: true, usuario: usuarioAtual };
}

/**
 * Realiza logout
 */
function logout() {
    usuarioAtual = null;
    localStorage.removeItem('prefeitura_usuario_atual');
    return { sucesso: true };
}

/**
 * Registra novo usuário com validações
 */
function registrarUsuario(nome, email, senha, senhaConfirm, role = 'usuario') {
    // Sanitiza inputs
    nome = sanitizeInput(nome);
    email = sanitizeInput(email.toLowerCase());
    
    // Validações
    if (!nome || nome.length < 3) {
        return { sucesso: false, mensagem: "Nome deve ter no mínimo 3 caracteres" };
    }
    
    if (!validateEmail(email)) {
        return { sucesso: false, mensagem: "Email inválido" };
    }
    
    if (senha !== senhaConfirm) {
        return { sucesso: false, mensagem: "As senhas não coincidem" };
    }
    
    if (!validatePasswordStrength(senha)) {
        return { sucesso: false, mensagem: "Senha fraca. Use mínimo 6 caracteres, com maiúscula e número" };
    }
    
    if (users.some(u => u.email === email)) {
        logAudit('REGISTRO_DUPLICADO', { email, timestamp: new Date().toISOString() });
        return { sucesso: false, mensagem: "Email já cadastrado" };
    }
    
    const novoUser = {
        id: Math.max(...users.map(u => u.id), 0) + 1,
        nome,
        email,
        senhaHash: hashPassword(senha), // Senha criptografada
        role: role || "usuario",
        ativo: true,
        dataCriacao: new Date().toISOString()
    };
    
    users.push(novoUser);
    localStorage.setItem('prefeitura_users', JSON.stringify(users));
    
    return { sucesso: true, mensagem: "Usuário registrado com sucesso" };
}

/**
 * Verifica se usuário está autenticado
 */
function estaAutenticado() {
    return usuarioAtual !== null;
}

/**
 * Obtém usuário atual
 */
function getUsuarioAtual() {
    return usuarioAtual;
}

/**
 * Verifica permissão do usuário
 */
function temPermissao(permissao) {
    if (!usuarioAtual) return false;
    
    const permissoesPorRole = {
        admin: ['criar', 'editar', 'deletar', 'visualizar'],
        gerenciador: ['criar', 'editar', 'visualizar'],
        usuario: ['visualizar']
    };
    
    return (permissoesPorRole[usuarioAtual.role] || []).includes(permissao);
}

/**
 * Lista todos os usuários (apenas para admin)
 */
function listarUsuarios() {
    if (!temPermissao('visualizar')) {
        return { sucesso: false, mensagem: "Acesso negado" };
    }
    
    return users.map(u => {
        const copy = { ...u };
        delete copy.senha;
        return copy;
    });
}

/**
 * Desativa usuário
 */
function desativarUsuario(userId) {
    if (!temPermissao('deletar')) {
        return { sucesso: false, mensagem: "Acesso negado" };
    }
    
    const user = users.find(u => u.id === userId);
    if (user) {
        user.ativo = false;
        localStorage.setItem('prefeitura_users', JSON.stringify(users));
        logAudit('USUARIO_DESATIVADO', { userId, admin: getUsuarioAtual().id });
        return { sucesso: true };
    }
    
    return { sucesso: false, mensagem: "Usuário não encontrado" };
}

/**
 * Ativa usuário
 */
function ativarUsuario(userId) {
    if (!temPermissao('deletar')) {
        return { sucesso: false, mensagem: "Acesso negado" };
    }
    
    const user = users.find(u => u.id === userId);
    if (user) {
        user.ativo = true;
        localStorage.setItem('prefeitura_users', JSON.stringify(users));
        logAudit('USUARIO_ATIVADO', { userId, admin: getUsuarioAtual().id });
        return { sucesso: true };
    }
    
    return { sucesso: false, mensagem: "Usuário não encontrado" };
}

/**
 * Log de auditoria - Registra ações importantes
 */
function logAudit(evento, dados = {}) {
    const logs = JSON.parse(localStorage.getItem('prefeitura_audit_logs') || '[]');
    
    const log = {
        id: logs.length + 1,
        evento,
        usuario: getUsuarioAtual()?.email || 'anônimo',
        dados,
        timestamp: new Date().toISOString(),
        ip: 'local' // Em produção: obter IP real do servidor
    };
    
    logs.push(log);
    
    // Mantém apenas últimos 1000 logs
    if (logs.length > 1000) {
        logs.splice(0, logs.length - 1000);
    }
    
    localStorage.setItem('prefeitura_audit_logs', JSON.stringify(logs));
    
    // Log no console para desenvolvimento
    console.log(`[AUDITORIA] ${evento}:`, dados);
}

/**
 * Retorna logs de auditoria (apenas para admin)
 */
function obterLogsAuditoria() {
    if (!temPermissao('visualizar')) {
        return [];
    }
    
    return JSON.parse(localStorage.getItem('prefeitura_audit_logs') || '[]');
}
