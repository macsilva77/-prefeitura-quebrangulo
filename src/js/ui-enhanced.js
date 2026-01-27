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
            
            // Mostrar botão flutuante
            const floatingBtn = document.getElementById('toggleSidebarFloat');
            if (floatingBtn) floatingBtn.classList.remove('hidden');
            
            // Esconder elementos do sidebar
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
            
            // Esconder botão flutuante
            const floatingBtn = document.getElementById('toggleSidebarFloat');
            if (floatingBtn) floatingBtn.classList.add('hidden');
            
            // Mostrar elementos do sidebar
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
    console.log('initMenuSearch - searchInput encontrado?', !!searchInput);
    
    if (!searchInput) {
        console.warn('❌ Campo de pesquisa não encontrado');
        return;
    }
    
    console.log('✓ Menu search inicializado');
    
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();
        console.log('🔍 Pesquisa:', searchTerm);
        
        // Todos os itens do menu: botões de navegação e links de administração
        const allItems = document.querySelectorAll('#sidebar nav button, #sidebar nav a, #sidebar a[href]');
        
        console.log('📋 Total de itens encontrados:', allItems.length);
        
        allItems.forEach(item => {
            const text = item.textContent.toLowerCase();
            const parent = item.closest('div') || item.parentElement;
            
            // Se não há termo de busca, mostrar tudo
            if (!searchTerm) {
                item.style.display = '';
                if (parent && parent.style) parent.style.display = '';
            } else {
                // Se o texto contém o termo, mostrar
                if (text.includes(searchTerm)) {
                    item.style.display = '';
                    if (parent && parent.style) parent.style.display = '';
                    console.log('  ✓ Mostrando:', item.textContent.trim());
                } else {
                    item.style.display = 'none';
                }
            }
        });
        
        // Mostrar/esconder seção de administração
        const adminLabels = Array.from(document.querySelectorAll('#sidebar .text-sm')).filter(el => 
            el.textContent.includes('Administração')
        );
        
        console.log('🏢 Seções Admin encontradas:', adminLabels.length);
        
        adminLabels.forEach(label => {
            if (!searchTerm) {
                label.style.display = '';
            } else {
                // Verificar se algum link da admin contém o termo
                const adminDiv = label.parentElement;
                const adminLinks = adminDiv ? adminDiv.querySelectorAll('a') : [];
                const hasMatch = Array.from(adminLinks).some(link => 
                    link.textContent.toLowerCase().includes(searchTerm)
                );
                label.style.display = hasMatch ? '' : 'none';
            }
        });
    });
}

// ===== CREATE FLOATING BUTTON =====
function createFloatingMenuButton() {
    // Verificar se já existe
    if (document.getElementById('toggleSidebarFloat')) return;
    
    const button = document.createElement('button');
    button.id = 'toggleSidebarFloat';
    button.className = 'hidden fixed left-6 top-6 z-50 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white transition p-2 rounded-lg';
    button.title = 'Mostrar menu';
    button.innerHTML = '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>';
    
    button.addEventListener('click', () => {
        const toggleBtn = document.getElementById('toggleSidebar');
        if (toggleBtn) toggleBtn.click();
    });
    
    document.body.appendChild(button);
}

// ===== DISPLAY USER INFO =====
function displayUserInfo() {
    try {
        console.log('displayUserInfo() chamado');
        const usuarioAtual = getUsuarioAtual();
        console.log('usuarioAtual:', usuarioAtual);
        
        if (usuarioAtual) {
            // Separar nome e sobrenome
            const nomePartes = usuarioAtual.nome.split(' ');
            const nome = nomePartes[0];
            const sobrenome = nomePartes.slice(1).join(' ') || '';
            
            const nomeCompleto = sobrenome ? `${nome} ${sobrenome}` : nome;
            console.log('Nome:', nome, 'Sobrenome:', sobrenome);
            
            // Atualizar elementos
            const usuarioEmailDropdown = document.getElementById('usuarioEmailDropdown');
            const usuarioEmailDropdown2 = document.getElementById('usuarioEmailDropdown2');
            
            console.log('Elementos encontrados:', { usuarioEmailDropdown, usuarioEmailDropdown2 });

            if (usuarioEmailDropdown) usuarioEmailDropdown.textContent = 'Usuário';
            if (usuarioEmailDropdown2) usuarioEmailDropdown2.textContent = usuarioAtual.email;
            
            console.log('✓ Elementos atualizados com sucesso');
        } else {
            console.warn('usuarioAtual é null');
        }
    } catch (error) {
        console.error('Erro ao exibir info do usuário:', error);
    }
}

// ===== PASSWORD RECOVERY LOGIC =====
function requestPasswordReset(email) {
    try {
        const usuarios = JSON.parse(localStorage.getItem('prefeitura_users') || '[]');
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
        const usuarios = JSON.parse(localStorage.getItem('prefeitura_users') || '[]');
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
        
        localStorage.setItem('prefeitura_users', JSON.stringify(usuarios));
        
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
    console.log('🔄 DOMContentLoaded - iniciando ui-enhanced');
    createFloatingMenuButton();
    initSidebarToggle();
    initMenuSearch();
    
    // Pequeno delay para garantir que os elementos estão prontos
    setTimeout(() => {
        console.log('⏱️ Executando displayUserInfo após delay');
        displayUserInfo();
    }, 100);
});
