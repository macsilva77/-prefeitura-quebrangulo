/**
 * UI Enhanced - Melhorias de Interface
 * - Toggle Sidebar
 * - Menu Search
 * - User Info Display
 * - Password Recovery
 */

// ===== SIDEBAR TOGGLE =====
function initSidebarToggle() {
    const toggleBtn = document.getElementById('toggleSidebar');
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    
    if (!toggleBtn) return;
    
    let isCollapsed = false;
    
    toggleBtn.addEventListener('click', () => {
        isCollapsed = !isCollapsed;
        
        if (isCollapsed) {
            sidebar.classList.remove('w-72');
            sidebar.classList.add('w-20');
            mainContent.classList.remove('ml-72');
            mainContent.classList.add('ml-20');
            document.querySelectorAll('#sidebar > div:not(.flex), nav, hr, div').forEach(el => {
                if (el !== toggleBtn && el.closest('#sidebar')) {
                    el.classList.add('hidden');
                }
            });
        } else {
            sidebar.classList.add('w-72');
            sidebar.classList.remove('w-20');
            mainContent.classList.add('ml-72');
            mainContent.classList.remove('ml-20');
            document.querySelectorAll('#sidebar > div:not(.flex), nav, hr, div').forEach(el => {
                if (el !== toggleBtn && el.closest('#sidebar')) {
                    el.classList.remove('hidden');
                }
            });
        }
        
        localStorage.setItem('sidebarCollapsed', isCollapsed);
    });
    
    // Restaurar estado anterior
    const wasCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    if (wasCollapsed) {
        toggleBtn.click();
    }
}

// ===== MENU SEARCH =====
function initMenuSearch() {
    const searchInput = document.getElementById('menuSearch');
    const navButtons = document.querySelectorAll('.nav-btn');
    
    if (!searchInput) return;
    
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        
        navButtons.forEach(btn => {
            const text = btn.textContent.toLowerCase();
            if (text.includes(searchTerm)) {
                btn.style.display = 'block';
            } else {
                btn.style.display = 'none';
            }
        });
    });
}

// ===== DISPLAY USER INFO =====
function displayUserInfo() {
    try {
        const usuarioAtual = getUsuarioAtual();
        
        if (usuarioAtual) {
            // Separar nome e sobrenome
            const nomePartes = usuarioAtual.nome.split(' ');
            const nome = nomePartes[0];
            const sobrenome = nomePartes.slice(1).join(' ') || '';
            
            const nomeCompleto = sobrenome ? `${nome} ${sobrenome}` : nome;
            
            // Atualizar elementos
            const usuarioNomeEl = document.getElementById('usuarioNome');
            const usuarioNomeCompletoEl = document.getElementById('usuarioNomeCompleto');
            const usuarioEmailEl = document.getElementById('usuarioEmail');
            
            if (usuarioNomeEl) usuarioNomeEl.textContent = nome;
            if (usuarioNomeCompletoEl) usuarioNomeCompletoEl.textContent = nomeCompleto;
            if (usuarioEmailEl) usuarioEmailEl.textContent = usuarioAtual.email;
        }
    } catch (error) {
        console.warn('Erro ao exibir info do usuário:', error);
    }
}

// ===== PASSWORD RECOVERY LOGIC =====
function requestPasswordReset(email) {
    try {
        const usuarios = JSON.parse(localStorage.getItem('prefeitura_usuarios') || '[]');
        const usuario = usuarios.find(u => u.email === email);
        
        if (!usuario) {
            return {
                sucesso: false,
                mensagem: 'Email não encontrado no sistema'
            };
        }
        
        // Gerar token temporário (válido por 30 minutos)
        const token = generateRandomToken();
        const expiracao = Date.now() + (30 * 60 * 1000); // 30 minutos
        
        // Armazenar requisição de reset
        const resetRequests = JSON.parse(localStorage.getItem('prefeitura_reset_requests') || '[]');
        resetRequests.push({
            email,
            token,
            expiracao,
            criado: new Date().toISOString()
        });
        
        localStorage.setItem('prefeitura_reset_requests', JSON.stringify(resetRequests));
        
        // Log auditoria
        logAudit('PASSWORD_RESET_SOLICITADO', {
            email,
            token: token.substring(0, 10) + '***',
            timestamp: new Date().toISOString()
        });
        
        return {
            sucesso: true,
            mensagem: 'Link de recuperação enviado! (Demo: verifique o console)',
            token, // Em produção, seria enviado por email
            email
        };
    } catch (error) {
        console.error('Erro ao solicitar reset:', error);
        return {
            sucesso: false,
            mensagem: 'Erro ao processar solicitação'
        };
    }
}

function validateResetToken(email, token) {
    try {
        const resetRequests = JSON.parse(localStorage.getItem('prefeitura_reset_requests') || '[]');
        const request = resetRequests.find(r => r.email === email && r.token === token);
        
        if (!request) {
            return {
                valido: false,
                mensagem: 'Token inválido'
            };
        }
        
        if (Date.now() > request.expiracao) {
            return {
                valido: false,
                mensagem: 'Link expirou. Solicite um novo.'
            };
        }
        
        return {
            valido: true,
            mensagem: 'Token válido'
        };
    } catch (error) {
        console.error('Erro ao validar token:', error);
        return {
            valido: false,
            mensagem: 'Erro ao validar'
        };
    }
}

function resetPassword(email, token, novaSenha) {
    try {
        // Validar token
        const validacao = validateResetToken(email, token);
        if (!validacao.valido) {
            return {
                sucesso: false,
                mensagem: validacao.mensagem
            };
        }
        
        // Validar força de senha
        if (!validatePasswordStrength(novaSenha)) {
            return {
                sucesso: false,
                mensagem: 'Senha fraca. Use: 6+ caracteres, 1 maiúscula, 1 número'
            };
        }
        
        // Atualizar senha
        const usuarios = JSON.parse(localStorage.getItem('prefeitura_usuarios') || '[]');
        const usuarioIndex = usuarios.findIndex(u => u.email === email);
        
        if (usuarioIndex === -1) {
            return {
                sucesso: false,
                mensagem: 'Usuário não encontrado'
            };
        }
        
        // Hash da nova senha
        const novoHash = hashPassword(novaSenha);
        usuarios[usuarioIndex].senhaHash = novoHash;
        
        localStorage.setItem('prefeitura_usuarios', JSON.stringify(usuarios));
        
        // Remover token usado
        const resetRequests = JSON.parse(localStorage.getItem('prefeitura_reset_requests') || '[]');
        const novasRequests = resetRequests.filter(r => !(r.email === email && r.token === token));
        localStorage.setItem('prefeitura_reset_requests', JSON.stringify(novasRequests));
        
        // Log auditoria
        logAudit('PASSWORD_RESET_CONCLUIDO', {
            email,
            timestamp: new Date().toISOString()
        });
        
        return {
            sucesso: true,
            mensagem: 'Senha alterada com sucesso! Faça login com a nova senha.'
        };
    } catch (error) {
        console.error('Erro ao resetar senha:', error);
        return {
            sucesso: false,
            mensagem: 'Erro ao alterar senha'
        };
    }
}

// ===== UTILITIES =====
function generateRandomToken(length = 32) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < length; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
}

// ===== INITIALIZE =====
document.addEventListener('DOMContentLoaded', () => {
    initSidebarToggle();
    initMenuSearch();
    
    // Pequeno delay para garantir que os elementos estão prontos
    setTimeout(() => {
        displayUserInfo();
    }, 100);
});
