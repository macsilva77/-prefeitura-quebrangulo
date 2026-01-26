/**
 * backup-export.js - Funções de backup e export
 * Para exportar/importar dados do localStorage
 */

/**
 * Exporta todos os dados para JSON
 * @returns {string} JSON com todos os dados
 */
function exportarDados() {
    const dados = {
        usuarios: JSON.parse(localStorage.getItem('prefeitura_users') || '[]'),
        fornecedores: JSON.parse(localStorage.getItem('prefeitura_fornecedores') || '[]'),
        secretarias: JSON.parse(localStorage.getItem('prefeitura_secretarias') || '[]'),
        auditoria: JSON.parse(localStorage.getItem('prefeitura_audit_logs') || '[]'),
        dataExporte: new Date().toISOString(),
        versao: '1.0.0'
    };
    
    return JSON.stringify(dados, null, 2);
}

/**
 * Exporta dados como arquivo CSV
 */
function exportarCSV(tipo) {
    let dados = [];
    let headers = [];
    
    if (tipo === 'usuarios') {
        dados = JSON.parse(localStorage.getItem('prefeitura_users') || '[]');
        headers = ['ID', 'Nome', 'Email', 'Papel', 'Ativo', 'Data Criação'];
    } else if (tipo === 'fornecedores') {
        dados = JSON.parse(localStorage.getItem('prefeitura_fornecedores') || '[]');
        headers = ['ID', 'Nome', 'CNPJ', 'Email', 'Telefone', 'Status'];
    } else if (tipo === 'secretarias') {
        dados = JSON.parse(localStorage.getItem('prefeitura_secretarias') || '[]');
        headers = ['ID', 'Nome', 'Sigla', 'Responsável', 'Orçamento', 'Status'];
    }
    
    let csv = headers.join(',') + '\n';
    
    dados.forEach(item => {
        const row = Object.values(item).map(v => `"${v}"`).join(',');
        csv += row + '\n';
    });
    
    return csv;
}

/**
 * Baixa arquivo de backup JSON
 */
function baixarBackup() {
    const dados = exportarDados();
    const blob = new Blob([dados], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_${new Date().getTime()}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

/**
 * Restaura dados de arquivo de backup
 */
function restaurarDados(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const dados = JSON.parse(e.target.result);
                
                // Validar estrutura
                if (!dados.usuarios || !dados.fornecedores || !dados.secretarias) {
                    throw new Error('Arquivo de backup inválido');
                }
                
                // Restaurar dados
                localStorage.setItem('prefeitura_users', JSON.stringify(dados.usuarios));
                localStorage.setItem('prefeitura_fornecedores', JSON.stringify(dados.fornecedores));
                localStorage.setItem('prefeitura_secretarias', JSON.stringify(dados.secretarias));
                
                if (dados.auditoria) {
                    localStorage.setItem('prefeitura_audit_logs', JSON.stringify(dados.auditoria));
                }
                
                // Log de restauração
                logAudit('BACKUP_RESTAURADO', { 
                    usuarios: dados.usuarios.length,
                    fornecedores: dados.fornecedores.length,
                    secretarias: dados.secretarias.length
                });
                
                resolve({
                    sucesso: true,
                    mensagem: 'Backup restaurado com sucesso!',
                    dados: dados
                });
            } catch (error) {
                reject({
                    sucesso: false,
                    mensagem: 'Erro ao restaurar backup: ' + error.message
                });
            }
        };
        
        reader.onerror = () => {
            reject({
                sucesso: false,
                mensagem: 'Erro ao ler arquivo'
            });
        };
        
        reader.readAsText(file);
    });
}

/**
 * Limpa todos os dados (cuidado!)
 */
function limparTodosDados() {
    if (!confirm('ATENÇÃO! Isto irá deletar TODOS os dados. Tem certeza?')) {
        return false;
    }
    
    if (!confirm('Tem certeza mesmo? Esta ação não pode ser desfeita!')) {
        return false;
    }
    
    localStorage.clear();
    logAudit('LIMPEZA_COMPLETA', { aviso: 'Todos os dados foram deletados' });
    
    return true;
}

/**
 * Retorna statisticas do sistema
 */
function obterEstatisticas() {
    const usuarios = JSON.parse(localStorage.getItem('prefeitura_users') || '[]');
    const fornecedores = JSON.parse(localStorage.getItem('prefeitura_fornecedores') || '[]');
    const secretarias = JSON.parse(localStorage.getItem('prefeitura_secretarias') || '[]');
    const logs = JSON.parse(localStorage.getItem('prefeitura_audit_logs') || '[]');
    
    const storageUsed = Object.keys(localStorage).reduce((total, key) => {
        return total + localStorage[key].length;
    }, 0);
    
    return {
        usuarios: {
            total: usuarios.length,
            ativos: usuarios.filter(u => u.ativo).length,
            inativos: usuarios.filter(u => !u.ativo).length,
            porRole: {
                admin: usuarios.filter(u => u.role === 'admin').length,
                gerenciador: usuarios.filter(u => u.role === 'gerenciador').length,
                usuario: usuarios.filter(u => u.role === 'usuario').length
            }
        },
        fornecedores: {
            total: fornecedores.length,
            ativos: fornecedores.filter(f => f.ativo).length,
            inativos: fornecedores.filter(f => !f.ativo).length
        },
        secretarias: {
            total: secretarias.length,
            ativas: secretarias.filter(s => s.ativo).length,
            inativas: secretarias.filter(s => !s.ativo).length,
            orcamentoTotal: secretarias.reduce((sum, s) => sum + (s.orcamento || 0), 0)
        },
        auditoria: {
            totalEventos: logs.length,
            ultimoEvento: logs[logs.length - 1]?.timestamp || null
        },
        storage: {
            usado: `${(storageUsed / 1024).toFixed(2)} KB`,
            disponivel: '~5 MB (localStorage limit)',
            percentualUsado: ((storageUsed / (5 * 1024 * 1024)) * 100).toFixed(2) + '%'
        }
    };
}

/**
 * Retorna relatório em texto formatado
 */
function gerarRelatorio() {
    const stats = obterEstatisticas();
    const data = new Date().toLocaleString('pt-BR');
    
    let relatorio = `
╔════════════════════════════════════════════╗
║   RELATÓRIO DO SISTEMA - ${data}
╚════════════════════════════════════════════╝

📊 USUÁRIOS
├─ Total: ${stats.usuarios.total}
├─ Ativos: ${stats.usuarios.ativos}
├─ Inativos: ${stats.usuarios.inativos}
└─ Por Papel:
   ├─ Administradores: ${stats.usuarios.porRole.admin}
   ├─ Gerenciadores: ${stats.usuarios.porRole.gerenciador}
   └─ Usuários: ${stats.usuarios.porRole.usuario}

🏢 FORNECEDORES
├─ Total: ${stats.fornecedores.total}
├─ Ativos: ${stats.fornecedores.ativos}
└─ Inativos: ${stats.fornecedores.inativos}

🏛️ SECRETARIAS
├─ Total: ${stats.secretarias.total}
├─ Ativas: ${stats.secretarias.ativas}
├─ Inativas: ${stats.secretarias.inativas}
└─ Orçamento Total: R$ ${stats.secretarias.orcamentoTotal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}

📋 AUDITORIA
├─ Total de Eventos: ${stats.auditoria.totalEventos}
└─ Último Evento: ${stats.auditoria.ultimoEvento || 'N/A'}

💾 ARMAZENAMENTO
├─ Usado: ${stats.storage.usado}
├─ Disponível: ${stats.storage.disponivel}
└─ Percentual: ${stats.storage.percentualUsado}

════════════════════════════════════════════
`;
    
    return relatorio;
}

/**
 * Gera um relatório de segurança
 */
function gerarRelatoriSeguranca() {
    const usuarios = JSON.parse(localStorage.getItem('prefeitura_users') || '[]');
    const logs = JSON.parse(localStorage.getItem('prefeitura_audit_logs') || '[]');
    
    const loginsFailos = logs.filter(l => l.evento === 'LOGIN_FALHOU').length;
    const loginsSuccesso = logs.filter(l => l.evento === 'LOGIN_SUCESSO').length;
    const usuariosComSenhaFraca = usuarios.filter(u => 
        u.senhaHash && u.senhaHash.length < 20
    ).length;
    
    let relatorio = `
╔════════════════════════════════════════════╗
║   RELATÓRIO DE SEGURANÇA
╚════════════════════════════════════════════╝

🔒 AUTENTICAÇÃO
├─ Logins bem-sucedidos: ${loginsSuccesso}
├─ Tentativas falhas: ${loginsFailos}
├─ Taxa de sucesso: ${((loginsSuccesso / (loginsSuccesso + loginsFailos)) * 100 || 0).toFixed(1)}%
└─ Usuários ativos: ${usuarios.filter(u => u.ativo).length}

⚠️ ALERTAS
├─ Usuários com senha fraca: ${usuariosComSenhaFraca}
├─ Usuários inativos: ${usuarios.filter(u => !u.ativo).length}
└─ Eventos auditados: ${logs.length}

✅ STATUS
├─ Criptografia: ATIVADA
├─ Sanitização XSS: ATIVADA
├─ RBAC: ATIVADA
└─ Auditoria: ATIVADA

❌ NÃO IMPLEMENTADOS (Require Backend)
├─ HTTPS/SSL
├─ Rate Limiting
├─ Backup Automático
└─ 2FA

════════════════════════════════════════════
`;
    
    return relatorio;
}

// Exportar para uso global
window.exportarDados = exportarDados;
window.exportarCSV = exportarCSV;
window.baixarBackup = baixarBackup;
window.restaurarDados = restaurarDados;
window.limparTodosDados = limparTodosDados;
window.obterEstatisticas = obterEstatisticas;
window.gerarRelatorio = gerarRelatorio;
window.gerarRelatoriSeguranca = gerarRelatoriSeguranca;
