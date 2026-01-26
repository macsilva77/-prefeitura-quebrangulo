/**
 * charts.js - Gerenciamento de gráficos
 */

let chartTop = null;
let chartVerbas = null;
let chartPizza = null;
let chartPizzaSecretaria = null;
let chartVerbasPorSecretaria = null;

/**
 * Renderiza todos os gráficos
 */
function renderCharts() {
    renderTopFornecedoresChart();
    renderPizzaChart();
    renderPizzaSecretariaChart();
    renderVerbasPorSecretariaChart();
}

/**
 * Renderiza gráfico de Top Fornecedores
 */
function renderTopFornecedoresChart() {
    const lista = filterPagamentos();
    const top = topFornecedores(lista);

    const ctx = document.getElementById("chartTopFornecedores");
    if (!ctx) return;

    if (chartTop) chartTop.destroy();

    chartTop = new Chart(ctx, {
        type: "bar",
        data: {
            labels: top.map(x => x.fornecedor),
            datasets: [{
                label: "Total pago",
                data: top.map(x => x.total),
                backgroundColor: "#3b82f6",
                borderColor: "#1d4ed8",
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 2,
            indexAxis: 'y',
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: (ctx) => " " + money(ctx.raw)
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        callback: (v) => money(v)
                    }
                }
            }
        }
    });
}

/**
 * Renderiza gráfico de Verbas
 */
function renderVerbaChart() {
    const { agg } = getVerbasFiltradas();
    const ctx = document.getElementById("chartVerbas");
    if (!ctx) return;

    if (chartVerbas) chartVerbas.destroy();

    chartVerbas = new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["Comparativo do período"],
            datasets: [
                {
                    label: "Verba recebida",
                    data: [agg.recebida],
                    backgroundColor: "#10b981"
                },
                {
                    label: "Verba destinada",
                    data: [agg.destinada],
                    backgroundColor: "#f59e0b"
                },
                {
                    label: "Verba aplicada",
                    data: [agg.aplicada],
                    backgroundColor: "#ef4444"
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 2,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: (ctx) => " " + money(ctx.raw)
                    }
                }
            },
            scales: {
                y: {
                    ticks: {
                        callback: (v) => money(v)
                    }
                }
            }
        }
    });
}

/**
 * Renderiza gráfico Pizza de Gastos por Secretaria
 */
function renderPizzaChart() {
    const { periodo } = getCurrentFilters();
    const gastos = gastosPrefeituraPorSecretaria(periodo);

    const ctx = document.getElementById("chartGastosPizza");
    if (!ctx) return;

    if (chartPizza) chartPizza.destroy();

    chartPizza = new Chart(ctx, {
        type: "pie",
        data: {
            labels: gastos.map(x => x.secretaria),
            datasets: [{
                label: "Gastos por secretaria",
                data: gastos.map(x => x.total),
                backgroundColor: [
                    "#3b82f6", "#ef4444", "#10b981", "#f59e0b",
                    "#8b5cf6", "#06b6d4", "#f43f5e", "#14b8a6"
                ],
                borderColor: "#fff",
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 1.5,
            onClick: (evt, elements) => {
                if (elements.length > 0) {
                    const index = elements[0].index;
                    const secretaria = gastos[index].secretaria;
                    
                    // Atualizar o filtro
                    document.getElementById("secretariaFilter").value = secretaria;
                    rerenderAll();
                }
            },
            plugins: {
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: (ctx) => ` ${ctx.label}: ${money(ctx.raw)}`
                    }
                }
            }
        }
    });
}

/**
 * Renderiza gráfico Pizza de Fornecedores por Secretaria
 */
function renderPizzaSecretariaChart() {
    const { periodo, secretaria } = getCurrentFilters();
    const box = document.getElementById("boxTopFornecedoresSecretaria");
    const title = document.getElementById("titlePizzaSecretaria");
    const canvas = document.getElementById("chartFornecedoresSecretariaPizza");

    if (secretaria === "__geral__") {
        box.classList.add("hidden");
        if (chartPizzaSecretaria) {
            chartPizzaSecretaria.destroy();
            chartPizzaSecretaria = null;
        }
        return;
    }

    box.classList.remove("hidden");
    if (!canvas) return;

    title.textContent = `Top fornecedores - ${secretaria} (${periodo})`;
    const topSec = topFornecedoresDaSecretaria(periodo, secretaria, 6);

    if (chartPizzaSecretaria) chartPizzaSecretaria.destroy();

    chartPizzaSecretaria = new Chart(canvas, {
        type: "pie",
        data: {
            labels: topSec.map(x => x.fornecedor),
            datasets: [{
                label: "Total pago",
                data: topSec.map(x => x.total),
                backgroundColor: [
                    "#3b82f6", "#ef4444", "#10b981", "#f59e0b",
                    "#8b5cf6", "#06b6d4"
                ],
                borderColor: "#fff",
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 1.5,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: (ctx) => ` ${ctx.label}: ${money(ctx.raw)}`
                    }
                }
            }
        }
    });
}

/**
 * Renderiza gráfico de Verba Recebida x Verba Paga por Secretaria (Stacked)
 */
function renderVerbasPorSecretariaChart() {
    console.log('🚀 renderVerbasPorSecretariaChart iniciado');
    
    const { periodo } = getCurrentFilters();
    console.log('📅 Período:', periodo);
    
    const ctx = document.getElementById("chartVerbasPorSecretaria");
    console.log('🎨 Canvas encontrado?', !!ctx);
    
    if (!ctx) {
        console.error('❌ Canvas #chartVerbasPorSecretaria não encontrado!');
        return;
    }

    if (chartVerbasPorSecretaria) chartVerbasPorSecretaria.destroy();

    // Obter dados de verbas por secretaria
    console.log('📊 SECRETARIAS disponárias:', SECRETARIAS);
    console.log('💰 Total de verbas no array:', verbas.length);
    console.log('📋 Todas as verbas:', verbas);
    
    const verbas_secretaria = SECRETARIAS.map(sec => {
        const v = verbas.find(x => x.periodo === periodo && x.secretaria === sec);
        const result = {
            secretaria: sec,
            recebida: v?.verba_recebida || 0,
            aplicada: v?.verba_aplicada || 0
        };
        console.log(`  ${sec}: recebida=${result.recebida}, paga=${result.aplicada}`);
        return result;
    }).filter(x => x.recebida > 0 || x.aplicada > 0);

    console.log('✅ Dados filtrados:', verbas_secretaria);
    console.log('📈 Total de secretarias com dados:', verbas_secretaria.length);

    if (verbas_secretaria.length === 0) {
        console.warn('⚠️ Nenhuma secretaria com dados para o período:', periodo);
    }

    const chartConfig = {
        type: "bar",
        data: {
            labels: verbas_secretaria.map(x => x.secretaria),
            datasets: [
                {
                    label: "Verba Recebida",
                    data: verbas_secretaria.map(x => x.recebida),
                    backgroundColor: "#10b981",
                    borderColor: "#059669",
                    borderWidth: 1
                },
                {
                    label: "Verba Paga",
                    data: verbas_secretaria.map(x => x.aplicada),
                    backgroundColor: "#ef4444",
                    borderColor: "#dc2626",
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 2,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: (ctx) => ` ${ctx.dataset.label}: ${money(ctx.raw)}`
                    }
                }
            },
            scales: {
                x: {
                    stacked: true
                },
                y: {
                    stacked: true,
                    ticks: {
                        callback: (v) => money(v)
                    }
                }
            }
        }
    };

    console.log('⚙️ Chart config:', chartConfig);

    try {
        chartVerbasPorSecretaria = new Chart(ctx, chartConfig);
        console.log('✨ Gráfico criado com sucesso!');
    } catch (err) {
        console.error('❌ Erro ao criar gráfico:', err);
    }
}
