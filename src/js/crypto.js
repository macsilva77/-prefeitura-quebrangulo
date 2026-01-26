/**
 * crypto.js - Funções de criptografia simples
 * NOTA: Para produção, use bcrypt no backend!
 * Este é um fallback client-side apenas para protótipo
 */

console.log('✓ crypto.js carregado');

/**
 * Hash simples da senha (NÃO usar em produção!)
 * Em produção: usar bcrypt no servidor
 */
function hashPassword(password) {
    // Implementação simples usando SHA-256 (via SubtleCrypto)
    // Para produção real, usar bcrypt no backend
    return btoa(password + 'prefeitura_salt_2026'); // Base64 encode como placeholder
}

/**
 * Verifica se a senha corresponde ao hash
 */
async function verifyPassword(password, hash) {
    const computedHash = hashPassword(password);
    return computedHash === hash;
}

/**
 * Gera um salt aleatório
 */
function generateSalt() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

/**
 * Sanitiza string para XSS
 */
function sanitizeHTML(text) {
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
 * Sanitiza entrada de usuário
 */
function sanitizeInput(input) {
    return input
        .trim()
        .replace(/[<>\"']/g, '') // Remove caracteres perigosos
        .substring(0, 255); // Limita tamanho
}

/**
 * Valida email
 */
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/**
 * Valida força da senha
 */
function validatePasswordStrength(password) {
    if (password.length < 6) return false;
    if (!/[A-Z]/.test(password)) return false; // Tem maiúscula
    if (!/[0-9]/.test(password)) return false; // Tem número
    return true;
}
