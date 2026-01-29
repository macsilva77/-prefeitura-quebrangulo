/**
 * verbas.js - Gerenciamento de verbas por secretaria
 * Armazena apenas verba_recebida. Verba aplicada é calculada com base nos pagamentos
 */

let verbasRecebidas = JSON.parse(localStorage.getItem('prefeitura_verbas_recebidas')) || [
    { periodo: "2026-01", secretaria: "Educação", verba_recebida: 900000 },
    { periodo: "2026-01", secretaria: "Saúde", verba_recebida: 1100000 },
    { periodo: "2026-01", secretaria: "Infraestrutura e Obras", verba_recebida: 1400000 },
    { periodo: "2026-01", secretaria: "Administração e Finanças", verba_recebida: 450000 },
    { periodo: "2026-01", secretaria: "Assistência Social", verba_recebida: 650000 },
    { periodo: "2026-01", secretaria: "Turismo, Cultura e Esporte", verba_recebida: 300000 },
    { periodo: "2026-01", secretaria: "Agricultura", verba_recebida: 280000 },
    { periodo: "2025-12", secretaria: "Educação", verba_recebida: 800000 },
    { periodo: "2025-12", secretaria: "Saúde", verba_recebida: 950000 },
];

/**
 * Lista todas as verbas recebidas
 */
function listarVerbasRecebidas(periodo = null, secretaria = null) {
    let resultado = verbasRecebidas;
    
    if (periodo) {
        resultado = resultado.filter(v => v.periodo === periodo);
    }
    
    if (secretaria) {
        resultado = resultado.filter(v => v.secretaria === secretaria);
    }
    
    return resultado;
}

/**
 * Obtém verba recebida por período e secretaria
 */
function obterVerbaRecebida(periodo, secretaria) {
    return verbasRecebidas.find(v => v.periodo === periodo && v.secretaria === secretaria);
}

/**
 * Calcula verba aplicada baseado nos pagamentos
 */
function calcularVerbaAplicada(periodo, secretaria) {
    if (!pagamentos) return 0;
    
    return pagamentos
        .filter(p => p.periodo === periodo && p.secretaria === secretaria)
        .reduce((total, p) => total + (p.valor || 0), 0);
}

/**
 * Obtém verba completa com aplicada calculada
 */
function obterVerbaCompleta(periodo, secretaria) {
    const recebida = obterVerbaRecebida(periodo, secretaria);
    const aplicada = calcularVerbaAplicada(periodo, secretaria);
    const verbaRecebidaValor = recebida?.verba_recebida || 0;
    const saldo = verbaRecebidaValor - aplicada;
    
    return {
        periodo,
        secretaria,
        verba_recebida: verbaRecebidaValor,
        verba_aplicada: aplicada,
        saldo: saldo,
        percentual_aplicado: verbaRecebidaValor > 0 ? (aplicada / verbaRecebidaValor) * 100 : 0
    };
}

/**
 * Cria/atualiza verba recebida
 */
function salvarVerbaRecebida(periodo, secretaria, verba_recebida) {
    if (!temPermissao('criar')) {
        return { sucesso: false, mensagem: "Acesso negado" };
    }
    
    // Validações
    if (!periodo || !secretaria || verba_recebida === undefined) {
        return { sucesso: false, mensagem: "Preencha todos os campos obrigatórios" };
    }
    
    // Verifica se já existe
    const indice = verbasRecebidas.findIndex(v => v.periodo === periodo && v.secretaria === secretaria);
    
    if (indice >= 0) {
        // Atualizar existente
        verbasRecebidas[indice].verba_recebida = Number(verba_recebida) || 0;
        localStorage.setItem('prefeitura_verbas_recebidas', JSON.stringify(verbasRecebidas));
        return { sucesso: true, mensagem: "Verba atualizada com sucesso" };
    } else {
        // Criar nova
        verbasRecebidas.push({
            periodo,
            secretaria,
            verba_recebida: Number(verba_recebida) || 0
        });
        localStorage.setItem('prefeitura_verbas_recebidas', JSON.stringify(verbasRecebidas));
        return { sucesso: true, mensagem: "Verba criada com sucesso" };
    }
}

/**
 * Obtém lista de períodos únicos
 */
function listarPeriodos() {
    // Combina períodos de verbas e pagamentos
    const periodosVerbas = verbasRecebidas.map(v => v.periodo);
    const periodosPagamentos = pagamentos ? pagamentos.map(p => p.periodo) : [];
    const todosPeriodos = [...new Set([...periodosVerbas, ...periodosPagamentos])];
    return todosPeriodos.sort().reverse();
}

/**
 * Deleta verba recebida
 */
function deletarVerbaRecebida(periodo, secretaria) {
    if (!temPermissao('deletar')) {
        return { sucesso: false, mensagem: "Acesso negado" };
    }
    
    const indice = verbasRecebidas.findIndex(v => v.periodo === periodo && v.secretaria === secretaria);
    if (indice >= 0) {
        verbasRecebidas.splice(indice, 1);
        localStorage.setItem('prefeitura_verbas_recebidas', JSON.stringify(verbasRecebidas));
        return { sucesso: true, mensagem: "Verba removida com sucesso" };
    }
    
    return { sucesso: false, mensagem: "Verba não encontrada" };
}

/**
 * Obtém resumo de verbas por período
 */
function resumoVerbasPeríodo(periodo) {
    const verbasCompletas = SECRETARIAS.map(sec => obterVerbaCompleta(periodo, sec));
    
    return {
        total_recebida: verbasCompletas.reduce((s, v) => s + (v.verba_recebida || 0), 0),
        total_aplicada: verbasCompletas.reduce((s, v) => s + (v.verba_aplicada || 0), 0),
        saldo_total: verbasCompletas.reduce((s, v) => s + (v.saldo || 0), 0),
        quantidade: verbasCompletas.length,
        detalhes: verbasCompletas
    };
}

/**
 * Obtém verbas por secretaria com detalhes
 */
function verbasPorSecretaria(periodo) {
    return SECRETARIAS.map(sec => obterVerbaCompleta(periodo, sec))
        .filter(v => v.verba_recebida > 0 || v.verba_aplicada > 0);
}
