/**
 * utils.js - Funções utilitárias
 * Funções reutilizáveis para processamento de dados
 */

/**
 * Formata número como moeda brasileira
 */
function money(value) {
    return Number(value || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

/**
 * Obtém os filtros atuais do formulário
 */
function getCurrentFilters() {
    const secretaria = document.getElementById("secretariaFilter")?.value || "__geral__";
    const periodo = document.getElementById("periodoFilter")?.value || "2026-01";
    const q = (document.getElementById("searchFornecedor")?.value || "").trim().toLowerCase();
    return { secretaria, periodo, q };
}

/**
 * Filtra pagamentos baseado nos critérios atuais
 */
function filterPagamentos() {
    const { secretaria, periodo, q } = getCurrentFilters();
    return pagamentos.filter(p => {
        const okPeriodo = p.periodo === periodo;
        const okSec = (secretaria === "__geral__") ? true : p.secretaria === secretaria;
        const okQ = q ? p.fornecedor.toLowerCase().includes(q) : true;
        return okPeriodo && okSec && okQ;
    });
}

/**
 * Obtém verbas filtradas
 */
function getVerbasFiltradas() {
    const { secretaria, periodo } = getCurrentFilters();
    const rows = verbas.filter(v => 
        v.periodo === periodo && (secretaria === "__geral__" ? true : v.secretaria === secretaria)
    );
    const agg = rows.reduce((acc, v) => {
        acc.recebida += v.verba_recebida || 0;
        acc.destinada += v.verba_destinada || 0;
        acc.aplicada += v.verba_aplicada || 0;
        return acc;
    }, { recebida: 0, destinada: 0, aplicada: 0 });
    return { rows, agg };
}

/**
 * Obtém top fornecedores
 */
function topFornecedores(listaPagamentos, topN = 8) {
    const map = new Map();
    for (const p of listaPagamentos) {
        map.set(p.fornecedor, (map.get(p.fornecedor) || 0) + p.valor);
    }
    return Array.from(map.entries())
        .map(([fornecedor, total]) => ({ fornecedor, total }))
        .sort((a, b) => b.total - a.total)
        .slice(0, topN);
}

/**
 * Calcula gastos por secretaria
 */
function gastosPrefeituraPorSecretaria(periodo) {
    const map = new Map();
    for (const s of SECRETARIAS) map.set(s, 0);
    for (const p of pagamentos) {
        if (p.periodo !== periodo) continue;
        map.set(p.secretaria, (map.get(p.secretaria) || 0) + (p.valor || 0));
    }
    return SECRETARIAS.map(s => ({ secretaria: s, total: map.get(s) || 0 }))
        .filter(x => x.total > 0);
}

/**
 * Top fornecedores de uma secretaria específica
 */
function topFornecedoresDaSecretaria(periodo, secretaria, topN = 6) {
    const lista = pagamentos.filter(p => p.periodo === periodo && p.secretaria === secretaria);
    return topFornecedores(lista, topN);
}

/**
 * Calcula disparidade por secretaria
 */
function disparidadePorSecretaria(periodo) {
    const rows = SECRETARIAS.map(sec => {
        const v = verbas.find(x => x.periodo === periodo && x.secretaria === sec);
        const recebida = v?.verba_recebida || 0;
        const aplicada = v?.verba_aplicada || 0;
        const disparidade = recebida - aplicada;
        const perc = recebida > 0 ? (aplicada / recebida) * 100 : null;
        return { secretaria: sec, recebida, aplicada, disparidade, perc };
    }).filter(r => r.recebida > 0 || r.aplicada > 0);

    rows.sort((a, b) => (b.disparidade) - (a.disparidade));
    return rows;
}
