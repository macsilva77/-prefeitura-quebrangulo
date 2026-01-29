/**
 * Main Application
 * Arquivo principal da aplicação com dashboard e gráficos
 */

import {
    formatCurrency,
    calculateSum,
    calculateAverage,
    saveToLocalStorage,
    getFromLocalStorage,
    sortExpensesByDate,
    filterByCategory,
    generateId,
    exportToCSV
} from './utils.js';

import {
    updateStatsCards,
    renderExpensesList,
    showSuccessNotification,
    showErrorNotification,
    resetForm,
    setDefaultDate,
    validateAndGetFormData,
    createConfirmModal
} from './components.js';

/**
 * Classe principal da aplicação
 */
class ExpenseTracker {
    constructor() {
        this.expenses = [];
        this.filteredExpenses = [];
        this.currentFilter = '';
        this.storageKey = 'expenses_data';
        this.charts = {};
        
        this.initializeApp();
    }

    /**
     * Inicializa a aplicação
     */
    initializeApp() {
        this.loadExpenses();
        this.setupEventListeners();
        this.setDefaultDate();
        this.render();
        this.initializeDashboard();
    }

    /**
     * Carrega despesas do localStorage
     */
    loadExpenses() {
        const saved = getFromLocalStorage(this.storageKey, []);
        this.expenses = Array.isArray(saved) ? saved : [];
        this.filteredExpenses = [...this.expenses];
    }

    /**
     * Salva despesas no localStorage
     */
    saveExpenses() {
        saveToLocalStorage(this.storageKey, this.expenses);
    }

    /**
     * Configura os event listeners
     */
    setupEventListeners() {
        // Navegação
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => this.handleNavigation(e));
        });

        // Formulário
        const form = document.getElementById('expenseForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }

        // Filtro de categoria
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => this.handleFilterChange(e));
        }

        // Botão limpar filtros
        const clearFiltersBtn = document.getElementById('clearFilters');
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => this.clearFilters());
        }

        // Botão exportar
        const exportBtn = document.getElementById('exportBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.handleExport());
        }
    }

    /**
     * Manipula navegação entre páginas
     */
    handleNavigation(e) {
        e.preventDefault();
        const pageId = e.currentTarget.dataset.page;
        
        // Atualizar nav items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('nav-item--active');
        });
        e.currentTarget.classList.add('nav-item--active');

        // Atualizar páginas
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('page--active');
        });
        document.querySelector(`[data-page-id="${pageId}"]`)?.classList.add('page--active');

        // Renderizar gráficos se for dashboard
        if (pageId === 'dashboard') {
            setTimeout(() => this.renderCharts(), 100);
        }
    }

    /**
     * Inicializa o dashboard
     */
    initializeDashboard() {
        this.updateDashboardStats();
        this.renderCharts();
    }

    /**
     * Atualiza estatísticas do dashboard
     */
    updateDashboardStats() {
        const amounts = this.expenses.map(e => e.amount);
        const total = calculateSum(amounts);

        const totalElement = document.getElementById('totalExpenses');
        if (totalElement) totalElement.textContent = formatCurrency(total);

        // Top supplier
        const grouped = this.groupBySupplier();
        const topSupplier = Object.entries(grouped).sort((a, b) => b[1] - a[1])[0];
        const topSupplierElement = document.getElementById('topSupplier');
        if (topSupplierElement) {
            topSupplierElement.textContent = topSupplier ? topSupplier[0] : '-';
        }

        // Budget stats
        const receivedBudget = 1850000;
        const receivedElement = document.getElementById('receivedBudget');
        if (receivedElement) receivedElement.textContent = formatCurrency(receivedBudget);

        const availableBudget = receivedBudget - total;
        const availableElement = document.getElementById('availableBudget');
        if (availableElement) availableElement.textContent = formatCurrency(availableBudget);
    }

    /**
     * Agrupa despesas por fornecedor/secretária
     */
    groupBySupplier() {
        return this.expenses.reduce((acc, expense) => {
            if (!acc[expense.description]) {
                acc[expense.description] = 0;
            }
            acc[expense.description] += expense.amount;
            return acc;
        }, {});
    }

    /**
     * Renderiza os gráficos
     */
    renderCharts() {
        this.renderSuppliersChart();
        this.renderBudgetChart();
        this.renderSecretariaChart();
    }

    /**
     * Renderiza gráfico de fornecedores
     */
    renderSuppliersChart() {
        const canvas = document.getElementById('suppliersChart');
        if (!canvas) return;

        const grouped = this.groupBySupplier();
        const labels = Object.keys(grouped).slice(0, 10);
        const data = Object.values(grouped).slice(0, 10);

        // Destruir gráfico anterior se existir
        if (this.charts.suppliers) {
            this.charts.suppliers.destroy();
        }

        this.charts.suppliers = new Chart(canvas, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: 'Valor (R$)',
                    data,
                    backgroundColor: '#6366f1',
                    borderColor: '#4f46e5',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => `R$ ${value.toLocaleString('pt-BR')}`
                        }
                    }
                }
            }
        });
    }

    /**
     * Renderiza gráfico de orçamento
     */
    renderBudgetChart() {
        const canvas = document.getElementById('budgetChart');
        if (!canvas) return;

        const total = calculateSum(this.expenses.map(e => e.amount));
        const received = 1850000;
        const applied = total;
        const pending = received - applied;

        if (this.charts.budget) {
            this.charts.budget.destroy();
        }

        this.charts.budget = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: ['Valor', 'Pendente'],
                datasets: [
                    {
                        label: 'Verba Recebida',
                        data: [received, 0],
                        backgroundColor: '#3b82f6',
                        borderColor: '#2563eb',
                        borderWidth: 1
                    },
                    {
                        label: 'Verba Aplicada',
                        data: [applied, 0],
                        backgroundColor: '#ec4899',
                        borderColor: '#db2777',
                        borderWidth: 1
                    },
                    {
                        label: 'Verba Pendente',
                        data: [0, pending],
                        backgroundColor: '#f59e0b',
                        borderColor: '#d97706',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        stacked: false,
                        ticks: {
                            callback: (value) => `R$ ${value.toLocaleString('pt-BR')}`
                        }
                    }
                }
            }
        });
    }

    /**
     * Renderiza gráfico de secretarias
     */
    renderSecretariaChart() {
        const canvas = document.getElementById('secretariaChart');
        if (!canvas) return;

        const byCategory = this.groupByCategory();
        const labels = Object.keys(byCategory);
        const data = Object.values(byCategory).map(expenses => 
            calculateSum(expenses.map(e => e.amount))
        );

        const colors = [
            '#3b82f6', '#ec4899', '#10b981', '#f59e0b',
            '#8b5cf6', '#06b6d4', '#f43f5e', '#14b8a6'
        ];

        if (this.charts.secretaria) {
            this.charts.secretaria.destroy();
        }

        this.charts.secretaria = new Chart(canvas, {
            type: 'doughnut',
            data: {
                labels,
                datasets: [{
                    data,
                    backgroundColor: colors,
                    borderColor: '#ffffff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    /**
     * Agrupa despesas por categoria
     */
    groupByCategory() {
        return this.expenses.reduce((acc, expense) => {
            const category = expense.category;
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(expense);
            return acc;
        }, {});
    }

    /**
     * Manipula o envio do formulário
     */
    handleFormSubmit(e) {
        e.preventDefault();

        const data = validateAndGetFormData();
        if (!data) return;

        const expense = {
            id: generateId(),
            description: data.description,
            amount: data.amount,
            category: data.category,
            date: data.date,
            createdAt: new Date().toISOString()
        };

        this.expenses.push(expense);
        this.saveExpenses();
        this.applyFilter();
        this.render();
        this.updateDashboardStats();
        resetForm();
        showSuccessNotification('✓ Despesa adicionada com sucesso!');
    }

    /**
     * Manipula a mudança de filtro
     */
    handleFilterChange(e) {
        this.currentFilter = e.target.value;
        this.applyFilter();
        this.render();
    }

    /**
     * Aplica o filtro de categoria
     */
    applyFilter() {
        if (this.currentFilter) {
            this.filteredExpenses = filterByCategory(this.expenses, this.currentFilter);
        } else {
            this.filteredExpenses = [...this.expenses];
        }
    }

    /**
     * Limpa os filtros
     */
    clearFilters() {
        this.currentFilter = '';
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.value = '';
        }
        this.applyFilter();
        this.render();
        showSuccessNotification('✓ Filtros limpos');
    }

    /**
     * Deleta uma despesa
     */
    deleteExpense(id) {
        createConfirmModal(
            'Tem certeza que deseja deletar esta despesa?',
            () => {
                this.expenses = this.expenses.filter(expense => expense.id !== id);
                this.saveExpenses();
                this.applyFilter();
                this.render();
                this.updateDashboardStats();
                showSuccessNotification('✓ Despesa deletada com sucesso!');
            }
        );
    }

    /**
     * Manipula a exportação de dados
     */
    handleExport() {
        if (this.expenses.length === 0) {
            showErrorNotification('Nenhuma despesa para exportar');
            return;
        }

        const dataToExport = this.expenses.map(expense => ({
            Descrição: expense.description,
            Valor: formatCurrency(expense.amount),
            Categoria: this.getCategoryName(expense.category),
            Data: this.formatDateForExport(expense.date),
            'Data de Criação': new Date(expense.createdAt).toLocaleString('pt-BR')
        }));

        const timestamp = new Date().toISOString().slice(0, 10);
        exportToCSV(dataToExport, `despesas_${timestamp}.csv`);
        showSuccessNotification('✓ Despesas exportadas em CSV!');
    }

    /**
     * Obtém o nome da categoria
     */
    getCategoryName(category) {
        const names = {
            educacao: 'Educação',
            saude: 'Saúde',
            administracao: 'Administração e Finanças',
            infraestrutura: 'Infraestrutura e Obras',
            assistencia: 'Assistência Social',
            turismo: 'Turismo, Cultura e Lazer',
            agricultura: 'Agricultura'
        };
        return names[category] || 'Desconhecido';
    }

    /**
     * Formata data para exportação
     */
    formatDateForExport(date) {
        const d = new Date(date);
        return d.toLocaleDateString('pt-BR');
    }

    /**
     * Calcula as estatísticas
     */
    calculateStats() {
        const sorted = sortExpensesByDate(this.filteredExpenses);
        const amounts = sorted.map(expense => expense.amount);
        const total = calculateSum(amounts);
        const average = calculateAverage(amounts);

        return {
            total,
            count: sorted.length,
            average
        };
    }

    /**
     * Renderiza a aplicação
     */
    render() {
        const sorted = sortExpensesByDate(this.filteredExpenses);
        renderExpensesList(sorted, (id) => this.deleteExpense(id));
    }

    /**
     * Define a data padrão
     */
    setDefaultDate() {
        setDefaultDate();
    }
}

/**
 * Inicializa a aplicação quando o DOM está pronto
 */
document.addEventListener('DOMContentLoaded', () => {
    new ExpenseTracker();
});
