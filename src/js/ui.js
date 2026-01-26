/**
 * ui.js - Componentes de UI e Renderização
 */

/**
 * Renderiza os KPIs
 */
function renderKPIs() {
    const lista = filterPagamentos();
    const totalPago = lista.reduce((s, p) => s + (p.valor || 0), 0);
    const top = topFornecedores(lista, 1)[0] || { fornecedor: "—", total: 0 };
    const { agg } = getVerbasFiltradas();
    const disparidade = (agg.recebida || 0) - (agg.aplicada || 0);

    document.getElementById("kpiTotalPago").textContent = money(totalPago);
    document.getElementById("kpiMaiorFornecedor").textContent = top.fornecedor;
    document.getElementById("kpiMaiorFornecedorValor").textContent = money(top.total);
    document.getElementById("kpiVerbaRecebida").textContent = money(agg.recebida);
    document.getElementById("kpiDisparidade").textContent = money(disparidade);
}

/**
 * Renderiza tabela de Pagamentos
 */
function renderTabelaPagamentos() {
    const lista = filterPagamentos().sort((a, b) => (a.data < b.data ? 1 : -1));
    const tbody = document.getElementById("tblPagamentos");

    if (!tbody) return;

    tbody.innerHTML = "";
    for (const p of lista) {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td class="p-4">${p.data}</td>
            <td class="p-4">${p.secretaria}</td>
            <td class="p-4 font-semibold">${p.fornecedor}</td>
            <td class="p-4">${p.documento}</td>
            <td class="p-4 text-right">${money(p.valor)}</td>
        `;
        tbody.appendChild(tr);
    }

    document.getElementById("tblFooter").textContent = `${lista.length} registro(s)`;
}

/**
 * Renderiza tabela de Disparidade
 */
function renderTabelaDisparidade() {
    const { periodo } = getCurrentFilters();
    document.getElementById("labelPeriodoDisparidade").textContent = `Período: ${periodo}`;

    const rows = disparidadePorSecretaria(periodo);
    const tbody = document.getElementById("tblDisparidade");

    if (!tbody) return;

    tbody.innerHTML = "";
    for (const r of rows) {
        const percText = (r.perc === null) ? "—" : `${r.perc.toFixed(1)}%`;
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td class="p-4 font-semibold">${r.secretaria}</td>
            <td class="p-4 text-right">${money(r.recebida)}</td>
            <td class="p-4 text-right">${money(r.aplicada)}</td>
            <td class="p-4 text-right">${money(r.disparidade)}</td>
            <td class="p-4 text-right">${percText}</td>
        `;
        tbody.appendChild(tr);
    }

    document.getElementById("tblDisparidadeFooter").textContent = `${rows.length} secretaria(s)`;
}

/**
 * Atualiza contadores de dados
 */
function renderCounts() {
    document.getElementById("countPagamentos").textContent = pagamentos.length;
    document.getElementById("countVerbas").textContent = verbas.length;
    document.getElementById("countSecretarias").textContent = SECRETARIAS.length;
}

/**
 * Renderiza toda a UI (KPIs, tabelas, gráficos)
 */
function rerenderAll() {
    renderKPIs();
    renderCharts();
    renderTabelaDisparidade();
    renderTabelaPagamentos();
    renderCounts();
}

/**
 * Muda a view ativa
 */
function showView(viewId, title, subtitle) {
    document.getElementById("viewDashboard").classList.add("hidden");
    document.getElementById("viewImport").classList.add("hidden");
    document.getElementById("viewData").classList.add("hidden");

    const view = document.getElementById(viewId);
    if (view) view.classList.remove("hidden");
}

/**
 * Inicializa a lista de secretarias na sidebar
 */
function initSecretariasList() {
    const secretariaList = document.getElementById("secretariaList");
    const select = document.getElementById("secretariaFilter");

    if (!secretariaList || !select) return;

    for (const s of SECRETARIAS) {
        const btn = document.createElement("button");
        btn.className = "w-full text-left px-2 py-1 rounded hover:bg-slate-800 text-sm transition-colors";
        btn.textContent = s;
        btn.onclick = (e) => {
            e.preventDefault();
            select.value = s;
            rerenderAll();
        };
        secretariaList.appendChild(btn);

        const opt = document.createElement("option");
        opt.value = s;
        opt.textContent = s;
        select.appendChild(opt);
    }
}
