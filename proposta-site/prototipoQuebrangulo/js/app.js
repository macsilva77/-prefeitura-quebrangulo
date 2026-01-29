/**
 * app.js - Inicialização da aplicação
 * Gerencia eventos e fluxo principal
 */

/**
 * Verifica autenticação e inicializa
 */
function checkAuthentication() {
    if (!estaAutenticado()) {
        window.location.href = "login.html";
        return false;
    }
    
    // Exibe informações do usuário (será complementado pelo ui-enhanced.js)
    const usuario = getUsuarioAtual();
    const usuarioNomeEl = document.getElementById("usuarioNome");
    if (usuario && usuarioNomeEl) {
        usuarioNomeEl.textContent = usuario.nome.split(' ')[0];
    }
    
    return true;
}

/**
 * Retorna nome legível do papel
 */
function getRoleName(role) {
    const names = {
        admin: "Administrador",
        gerenciador: "Gerenciador",
        usuario: "Usuário"
    };
    return names[role] || role;
}

/**
 * Inicializa a aplicação
 */
function init() {
    console.log('🚀 init() chamado');
    // Verifica autenticação
    if (!checkAuthentication()) return;

    // Event listener - Logout
    document.getElementById("btnLogout").addEventListener("click", () => {
        logout();
        window.location.href = "login.html";
    });

    // Inicializa UI
    initSecretariasList();

    // Event listeners - Navegação
    document.querySelectorAll(".nav-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            const page = btn.dataset.page;

            // Atualiza estados de ativo para a paleta azul
            document.querySelectorAll(".nav-btn").forEach(b => {
                b.classList.remove("bg-blue-800", "text-white");
                b.classList.add("text-blue-100");
            });
            btn.classList.add("bg-blue-800", "text-white");
            btn.classList.remove("text-blue-100");

            // Muda view
            if (page === "dashboard") {
                showView("viewDashboard");
                setTimeout(() => renderCharts(), 100);
            } else if (page === "import") {
                showView("viewImport");
            } else if (page === "data") {
                showView("viewData");
                renderCounts();
            } else if (page === "fornecedores") {
                showView("viewFornecedores");
                renderFornecedoresTable();
            } else if (page === "secretarias") {
                showView("viewSecretarias");
                renderSecretariasTable();
            } else if (page === "usuarios") {
                showView("viewUsuarios");
                renderUsuariosTable();
            }
        });
    });

    // Event listeners - Dashboard Filters
    document.getElementById("btnRefresh").addEventListener("click", rerenderAll);
    document.getElementById("secretariaFilter").addEventListener("change", rerenderAll);
    document.getElementById("periodoFilter").addEventListener("change", rerenderAll);
    document.getElementById("searchFornecedor").addEventListener("input", rerenderAll);

    // Event listeners - Chart Type Toggle
    const btnChartBarra = document.getElementById("btnChartBarra");
    const btnChartPizza = document.getElementById("btnChartPizza");
    
    if (btnChartBarra) {
        btnChartBarra.addEventListener("click", () => {
            chartSecretariaType = 'barra';
            updateChartToggleButtons('barra');
            renderSecretariaChart();
        });
    }
    
    if (btnChartPizza) {
        btnChartPizza.addEventListener("click", () => {
            chartSecretariaType = 'pizza';
            updateChartToggleButtons('pizza');
            renderSecretariaChart();
        });
    }

    // Event listeners - Importação
    document.getElementById("btnImportExcel").addEventListener("click", handleExcelImport);
    document.getElementById("btnFetchApi").addEventListener("click", handleApiImport);

    // Event listeners - Fornecedores
    if (temPermissao('criar')) {
        document.getElementById("btnNovoFornecedor").addEventListener("click", showModalNovoFornecedor);
    } else {
        document.getElementById("btnNovoFornecedor").style.display = "none";
    }

    // Event listeners - Secretarias
    if (temPermissao('criar')) {
        document.getElementById("btnNovaSecretaria").addEventListener("click", showModalNovaSecretaria);
    } else {
        document.getElementById("btnNovaSecretaria").style.display = "none";
    }

    // Event listeners - Usuários
    if (getUsuarioAtual().role === 'admin') {
        document.getElementById("btnNovoUsuario").addEventListener("click", showModalNovoUsuario);
    } else {
        document.getElementById("btnNovoUsuario").style.display = "none";
    }

    // Renderização inicial
    rerenderAll();
}

/**
 * Renderiza tabela de fornecedores
 */
function renderFornecedoresTable() {
    const fornecedores = listarFornecedores();
    const tbody = document.getElementById("tbodyFornecedores");
    tbody.innerHTML = "";

    fornecedores.forEach(f => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td class="px-6 py-4 text-sm text-slate-900">${f.nome}</td>
            <td class="px-6 py-4 text-sm text-slate-600">${f.cnpj}</td>
            <td class="px-6 py-4 text-sm text-slate-600">${f.email}</td>
            <td class="px-6 py-4 text-sm text-slate-600">${f.telefone}</td>
            <td class="px-6 py-4 text-sm">
                <span class="px-3 py-1 rounded-full text-xs font-semibold ${
                    f.ativo 
                        ? "bg-green-100 text-green-800" 
                        : "bg-red-100 text-red-800"
                }">
                    ${f.ativo ? "Ativo" : "Inativo"}
                </span>
            </td>
            <td class="px-6 py-4 text-center text-sm space-x-2">
                ${temPermissao('editar') ? `<button onclick="editarFornecedor(${f.id})" class="text-blue-600 hover:text-blue-800 font-semibold">Editar</button>` : ""}
                ${temPermissao('deletar') ? `<button onclick="deletarFornecedor(${f.id})" class="text-red-600 hover:text-red-800 font-semibold">Deletar</button>` : ""}
            </td>
        `;
        tbody.appendChild(tr);
    });
}

/**
 * Renderiza tabela de secretarias
 */
function renderSecretariasTable() {
    const secretarias = listarSecretarias();
    const tbody = document.getElementById("tbodySecretarias");
    tbody.innerHTML = "";

    secretarias.forEach(s => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td class="px-6 py-4 text-sm text-slate-900">${s.nome}</td>
            <td class="px-6 py-4 text-sm text-slate-600">${s.sigla}</td>
            <td class="px-6 py-4 text-sm text-slate-600">${s.responsavel}</td>
            <td class="px-6 py-4 text-sm text-slate-600">R$ ${(s.orcamento || 0).toLocaleString('pt-BR')}</td>
            <td class="px-6 py-4 text-sm">
                <span class="px-3 py-1 rounded-full text-xs font-semibold ${
                    s.ativo 
                        ? "bg-green-100 text-green-800" 
                        : "bg-red-100 text-red-800"
                }">
                    ${s.ativo ? "Ativo" : "Inativo"}
                </span>
            </td>
            <td class="px-6 py-4 text-center text-sm space-x-2">
                ${temPermissao('editar') ? `<button onclick="editarSecretaria(${s.id})" class="text-blue-600 hover:text-blue-800 font-semibold">Editar</button>` : ""}
                ${temPermissao('deletar') ? `<button onclick="deletarSecretaria(${s.id})" class="text-red-600 hover:text-red-800 font-semibold">Deletar</button>` : ""}
            </td>
        `;
        tbody.appendChild(tr);
    });
}

/**
 * Renderiza tabela de usuários
 */
function renderUsuariosTable() {
    const usuario = getUsuarioAtual();
    if (usuario.role !== 'admin') {
        document.getElementById("tbodyUsuarios").innerHTML = "<tr><td colspan='5' class='text-center py-6 text-slate-600'>Acesso negado</td></tr>";
        return;
    }

    const usuarios = listarUsuarios();
    const tbody = document.getElementById("tbodyUsuarios");
    tbody.innerHTML = "";

    usuarios.forEach(u => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td class="px-6 py-4 text-sm text-slate-900">${u.nome}</td>
            <td class="px-6 py-4 text-sm text-slate-600">${u.email}</td>
            <td class="px-6 py-4 text-sm text-slate-600">${getRoleName(u.role)}</td>
            <td class="px-6 py-4 text-sm">
                <span class="px-3 py-1 rounded-full text-xs font-semibold ${
                    u.ativo 
                        ? "bg-green-100 text-green-800" 
                        : "bg-red-100 text-red-800"
                }">
                    ${u.ativo ? "Ativo" : "Inativo"}
                </span>
            </td>
            <td class="px-6 py-4 text-center text-sm">
                ${u.ativo ? `<button onclick="desativarUsuarioModal(${u.id})" class="text-red-600 hover:text-red-800 font-semibold">Desativar</button>` : `<button onclick="ativarUsuarioModal(${u.id})" class="text-green-600 hover:text-green-800 font-semibold">Ativar</button>`}
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Placeholder functions para CRUD admin
function showModalNovoFornecedor() {
    alert("Funcionalidade de criar novo fornecedor em desenvolvimento");
}

function showModalNovaSecretaria() {
    alert("Funcionalidade de criar nova secretaria em desenvolvimento");
}

function showModalNovoUsuario() {
    alert("Funcionalidade de criar novo usuário em desenvolvimento");
}

function editarFornecedor(id) {
    alert("Funcionalidade de editar fornecedor em desenvolvimento");
}

function deletarFornecedor(id) {
    if (!confirm("Deseja deletar este fornecedor?")) return;
    desativarFornecedor(id);
    renderFornecedoresTable();
}

function editarSecretaria(id) {
    alert("Funcionalidade de editar secretaria em desenvolvimento");
}

function deletarSecretaria(id) {
    if (!confirm("Deseja deletar esta secretaria?")) return;
    desativarSecretaria(id);
    renderSecretariasTable();
}

function desativarUsuarioModal(id) {
    if (!confirm("Deseja desativar este usuário?")) return;
    desativarUsuario(id);
    renderUsuariosTable();
}

function ativarUsuarioModal(id) {
    if (!confirm("Deseja ativar este usuário?")) return;
    // Function to activate user - add if needed in auth.js
    renderUsuariosTable();
}

/**
 * Importa dados do Excel
 */
async function handleExcelImport() {
    const file = document.getElementById("excelFile").files?.[0];
    if (!file) {
        alert("Selecione um arquivo Excel (.xlsx).");
        return;
    }

    try {
        const buf = await file.arrayBuffer();
        const wb = XLSX.read(buf, { type: "array" });

        const sheetPag = wb.Sheets["Pagamentos"];
        const sheetVer = wb.Sheets["Verbas"];

        if (!sheetPag || !sheetVer) {
            alert('O Excel precisa ter 2 abas: "Pagamentos" e "Verbas".');
            return;
        }

        const rowsPag = XLSX.utils.sheet_to_json(sheetPag, { defval: "" });
        const rowsVer = XLSX.utils.sheet_to_json(sheetVer, { defval: "" });

        // Parse Pagamentos
        pagamentos = rowsPag.map(r => ({
            data: String(r.data_pagamento || r.data || "").slice(0, 10),
            periodo: String(r.periodo || ""),
            secretaria: String(r.secretaria || ""),
            fornecedor: String(r.fornecedor || ""),
            documento: String(r.documento || r.nota || ""),
            valor: Number(r.valor || 0)
        })).filter(p => p.periodo && p.secretaria && p.fornecedor);

        // Parse Verbas
        verbas = rowsVer.map(r => ({
            periodo: String(r.periodo || ""),
            secretaria: String(r.secretaria || ""),
            verba_recebida: Number(r.verba_recebida || 0),
            verba_destinada: Number(r.verba_destinada_especifica || r.verba_destinada || 0),
            verba_aplicada: Number(r.verba_aplicada || 0),
            observacao: String(r.observacao || "")
        })).filter(v => v.periodo && v.secretaria);

        alert("✓ Importação concluída com sucesso!");
        document.getElementById("excelFile").value = "";
        rerenderAll();
        showView("viewDashboard");
    } catch (error) {
        alert("Erro ao importar arquivo: " + error.message);
    }
}

/**
 * Importa dados de API (mock)
 */
function handleApiImport() {
    const baseUrl = document.getElementById("apiBaseUrl").value.trim();
    if (!baseUrl) {
        alert("Digite uma URL base.");
        return;
    }
    alert(`(Protótipo) Aqui chamaria a API em: ${baseUrl}/pagamentos e ${baseUrl}/verbas`);
}

/**
 * Inicializa quando o DOM está pronto
 */
document.addEventListener("DOMContentLoaded", init);
