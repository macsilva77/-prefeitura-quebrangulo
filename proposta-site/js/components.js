/**
 * Components
 * Componentes reutilizáveis da aplicação
 */

import {
    formatCurrency,
    formatDate,
    getTodayDate
} from './utils.js';

/**
 * Mapeia categorias para emojis
 */
const categoryEmojis = {
    alimentacao: '🍔',
    transporte: '🚗',
    saude: '⚕️',
    educacao: '📚',
    lazer: '🎮',
    contas: '📄',
    outros: '📦'
};

/**
 * Cria um elemento de despesa
 * @param {Object} expense - Objeto de despesa
 * @param {Function} onDelete - Callback para deletar
 * @returns {HTMLElement}
 */
export function createExpenseItem(expense, onDelete) {
    const item = document.createElement('div');
    item.className = 'expense-item';
    item.dataset.id = expense.id;

    const emoji = categoryEmojis[expense.category] || '📦';

    item.innerHTML = `
        <div class="expense-item__left">
            <div class="expense-item__category">${emoji}</div>
            <div class="expense-item__details">
                <div class="expense-item__description">${escapeHtml(expense.description)}</div>
                <div class="expense-item__date">${formatDate(expense.date)}</div>
            </div>
        </div>
        <div class="expense-item__right">
            <div class="expense-item__amount">- ${formatCurrency(expense.amount)}</div>
            <button class="expense-item__delete" aria-label="Deletar despesa">🗑️</button>
        </div>
    `;

    const deleteBtn = item.querySelector('.expense-item__delete');
    deleteBtn.addEventListener('click', () => onDelete(expense.id));

    return item;
}

/**
 * Atualiza o card de estatísticas
 * @param {Object} stats - Objeto com estatísticas
 * @param {number} stats.total - Total de despesas
 * @param {number} stats.count - Número de despesas
 * @param {number} stats.average - Média de despesas
 */
export function updateStatsCards(stats) {
    const totalElement = document.getElementById('totalExpenses');
    const countElement = document.getElementById('expenseCount');
    const averageElement = document.getElementById('averageExpense');

    if (totalElement) totalElement.textContent = formatCurrency(stats.total);
    if (countElement) countElement.textContent = stats.count;
    if (averageElement) averageElement.textContent = formatCurrency(stats.average);
}

/**
 * Limpa a lista de despesas
 */
export function clearExpensesList() {
    const list = document.getElementById('expensesList');
    if (list) {
        list.innerHTML = '<p class="expenses-list__empty">Nenhuma despesa registrada ainda.</p>';
    }
}

/**
 * Renderiza a lista de despesas
 * @param {Object[]} expenses - Array de despesas
 * @param {Function} onDelete - Callback para deletar
 */
export function renderExpensesList(expenses, onDelete) {
    const list = document.getElementById('expensesList');
    if (!list) return;

    if (expenses.length === 0) {
        clearExpensesList();
        return;
    }

    list.innerHTML = '';
    expenses.forEach(expense => {
        const item = createExpenseItem(expense, onDelete);
        list.appendChild(item);
    });
}

/**
 * Mostra uma notificação de sucesso
 * @param {string} message - Mensagem a exibir
 * @param {number} duration - Duração em ms
 */
export function showSuccessNotification(message, duration = 3000) {
    const notification = createNotification(message, 'success');
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, duration);
}

/**
 * Mostra uma notificação de erro
 * @param {string} message - Mensagem a exibir
 * @param {number} duration - Duração em ms
 */
export function showErrorNotification(message, duration = 3000) {
    const notification = createNotification(message, 'error');
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, duration);
}

/**
 * Cria um elemento de notificação
 * @param {string} message - Mensagem
 * @param {string} type - Tipo (success ou error)
 * @returns {HTMLElement}
 */
function createNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 20px;
        border-radius: 8px;
        background-color: ${type === 'success' ? '#10b981' : '#ef4444'};
        color: white;
        font-weight: 500;
        box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
        z-index: 9999;
        animation: slideIn 0.3s ease-out;
    `;

    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);

    return notification;
}

/**
 * Escapa caracteres HTML especiais
 * @param {string} text - Texto a escapar
 * @returns {string}
 */
export function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, char => map[char]);
}

/**
 * Reseta o formulário
 */
export function resetForm() {
    const form = document.getElementById('expenseForm');
    if (form) {
        form.reset();
        const dateInput = document.getElementById('date');
        if (dateInput) {
            dateInput.value = getTodayDate();
        }
    }
}

/**
 * Define a data padrão do formulário
 */
export function setDefaultDate() {
    const dateInput = document.getElementById('date');
    if (dateInput) {
        dateInput.value = getTodayDate();
    }
}

/**
 * Valida o formulário
 * @returns {Object|null} Objeto de despesa ou null se inválido
 */
export function validateAndGetFormData() {
    const description = document.getElementById('description').value.trim();
    const amount = parseFloat(document.getElementById('amount').value);
    const category = document.getElementById('category').value;
    const date = document.getElementById('date').value;

    if (!description) {
        showErrorNotification('Por favor, preencha a descrição');
        return null;
    }

    if (isNaN(amount) || amount <= 0) {
        showErrorNotification('Por favor, insira um valor válido');
        return null;
    }

    if (!category) {
        showErrorNotification('Por favor, selecione uma categoria');
        return null;
    }

    if (!date) {
        showErrorNotification('Por favor, selecione uma data');
        return null;
    }

    return {
        description,
        amount,
        category,
        date
    };
}

/**
 * Cria um modal de confirmação
 * @param {string} message - Mensagem
 * @param {Function} onConfirm - Callback ao confirmar
 * @param {Function} onCancel - Callback ao cancelar
 */
export function createConfirmModal(message, onConfirm, onCancel) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
    `;

    const content = document.createElement('div');
    content.style.cssText = `
        background-color: white;
        padding: 24px;
        border-radius: 12px;
        box-shadow: 0 20px 25px rgba(0, 0, 0, 0.1);
        max-width: 400px;
        text-align: center;
    `;

    content.innerHTML = `
        <p style="margin-bottom: 24px; font-size: 16px; color: #1e293b;">${message}</p>
        <div style="display: flex; gap: 12px;">
            <button class="cancel-btn" style="flex: 1; padding: 10px; border: 2px solid #e2e8f0; background-color: #f1f5f9; border-radius: 8px; cursor: pointer; font-weight: 500;">Cancelar</button>
            <button class="confirm-btn" style="flex: 1; padding: 10px; border: none; background-color: #ef4444; color: white; border-radius: 8px; cursor: pointer; font-weight: 500;">Confirmar</button>
        </div>
    `;

    modal.appendChild(content);

    const cancelBtn = content.querySelector('.cancel-btn');
    const confirmBtn = content.querySelector('.confirm-btn');

    cancelBtn.addEventListener('click', () => {
        modal.remove();
        onCancel?.();
    });

    confirmBtn.addEventListener('click', () => {
        modal.remove();
        onConfirm();
    });

    document.body.appendChild(modal);
}
