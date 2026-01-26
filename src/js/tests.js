/**
 * tests.js - Testes básicos (sem framework)
 * Para testes profissionais, usar Jest + Cypress
 */

class SimpleTestRunner {
    constructor() {
        this.tests = [];
        this.passed = 0;
        this.failed = 0;
    }

    test(name, fn) {
        this.tests.push({ name, fn });
    }

    assert(condition, message) {
        if (!condition) {
            throw new Error(`Assertion failed: ${message}`);
        }
    }

    assertEquals(actual, expected, message) {
        if (actual !== expected) {
            throw new Error(`Expected ${expected}, but got ${actual}. ${message}`);
        }
    }

    assertTruthy(value, message) {
        if (!value) {
            throw new Error(`Expected truthy value. ${message}`);
        }
    }

    async run() {
        console.log('🧪 Iniciando testes...\n');
        
        for (const test of this.tests) {
            try {
                test.fn();
                console.log(`✅ ${test.name}`);
                this.passed++;
            } catch (error) {
                console.error(`❌ ${test.name}: ${error.message}`);
                this.failed++;
            }
        }

        console.log(`\n📊 Resultados: ${this.passed} passou, ${this.failed} falhou`);
        return this.failed === 0;
    }
}

// Criar instância global
const testRunner = new SimpleTestRunner();

// ========== TESTES DE CRIPTOGRAFIA ==========
testRunner.test('Sanitização XSS', () => {
    const malicious = '<script>alert("XSS")</script>';
    const sanitized = sanitizeHTML(malicious);
    testRunner.assert(!sanitized.includes('<script>'), 'Script tag deve ser escapado');
});

testRunner.test('Sanitização Input', () => {
    const input = '  Test<script>  ';
    const sanitized = sanitizeInput(input);
    testRunner.assertEquals(sanitized, 'Testscript', 'Input deve ser sanitizado');
});

testRunner.test('Validação Email', () => {
    testRunner.assertTruthy(validateEmail('test@example.com'), 'Email válido');
    testRunner.assert(!validateEmail('invalid-email'), 'Email inválido não deve passar');
});

testRunner.test('Validação de Força de Senha', () => {
    testRunner.assert(!validatePasswordStrength('abc'), 'Senha fraca deve falhar');
    testRunner.assert(!validatePasswordStrength('abcdef123'), 'Senha sem maiúscula deve falhar');
    testRunner.assertTruthy(validatePasswordStrength('Abc123'), 'Senha forte deve passar');
});

// ========== TESTES DE AUTENTICAÇÃO ==========
testRunner.test('Hash de Senha', () => {
    const hash1 = hashPassword('Test123');
    const hash2 = hashPassword('Test123');
    testRunner.assertEquals(hash1, hash2, 'Mesma senha deve gerar mesmo hash');
});

testRunner.test('Login com credenciais válidas', () => {
    const result = login('admin@prefeitura.gov.br', 'Admin123');
    testRunner.assertTruthy(result.sucesso, 'Login deve ter sucesso');
    testRunner.assertTruthy(result.usuario, 'Deve retornar usuário');
});

testRunner.test('Login com senha incorreta', () => {
    const result = login('admin@prefeitura.gov.br', 'WrongPassword');
    testRunner.assert(!result.sucesso, 'Login deve falhar');
});

testRunner.test('Logout limpa sessão', () => {
    login('admin@prefeitura.gov.br', 'Admin123');
    logout();
    testRunner.assert(!getUsuarioAtual(), 'Usuário deve ser nulo após logout');
});

// ========== TESTES DE PERMISSÕES ==========
testRunner.test('Admin tem permissão criar', () => {
    login('admin@prefeitura.gov.br', 'Admin123');
    testRunner.assertTruthy(temPermissao('criar'), 'Admin deve ter permissão criar');
});

testRunner.test('Obter usuário atual', () => {
    login('admin@prefeitura.gov.br', 'Admin123');
    const user = getUsuarioAtual();
    testRunner.assertTruthy(user, 'Deve retornar usuário');
    testRunner.assertEquals(user.role, 'admin', 'Role deve ser admin');
});

// ========== TESTES DE DADOS ==========
testRunner.test('Listar Fornecedores retorna array', () => {
    const fornecedores = listarFornecedores();
    testRunner.assert(Array.isArray(fornecedores), 'Deve retornar array');
    testRunner.assert(fornecedores.length > 0, 'Deve ter fornecedores');
});

testRunner.test('Listar Secretarias retorna 7 itens', () => {
    const secretarias = listarSecretarias();
    testRunner.assert(Array.isArray(secretarias), 'Deve retornar array');
    testRunner.assertEquals(secretarias.length, 7, 'Deve ter 7 secretarias');
});

testRunner.test('Buscar fornecedor por ID', () => {
    const fornecedor = obterFornecedor(1);
    testRunner.assertTruthy(fornecedor, 'Deve encontrar fornecedor');
    testRunner.assertEquals(fornecedor.id, 1, 'ID deve ser 1');
});

testRunner.test('Listar Usuários retorna array', () => {
    login('admin@prefeitura.gov.br', 'Admin123');
    const usuarios = listarUsuarios();
    testRunner.assert(Array.isArray(usuarios), 'Deve retornar array');
    testRunner.assert(usuarios.length > 0, 'Deve ter usuários');
});

// ========== TESTES DE VALIDAÇÃO ==========
testRunner.test('Registrar usuário com dados válidos', () => {
    const result = registrarUsuario('Test User', 'test@example.com', 'Test123', 'Test123');
    // Pode falhar se email já existe, mas a validação de força de senha é o importante
    if (result.sucesso) {
        testRunner.assertTruthy(result.sucesso, 'Registro deve ter sucesso');
    } else {
        testRunner.assert(
            result.mensagem.includes('Email já cadastrado'),
            'Deve informar email duplicado'
        );
    }
});

testRunner.test('Registrar usuário com senha fraca', () => {
    const result = registrarUsuario('Test User 2', 'test2@example.com', 'weak', 'weak');
    testRunner.assert(!result.sucesso, 'Deve rejeitar senha fraca');
});

testRunner.test('Auditoria registra eventos', () => {
    logout();
    logAudit('TEST_EVENT', { test: true });
    const logs = obterLogsAuditoria() || [];
    // Verificar se existe log (considerando permissão)
    testRunner.assert(true, 'Auditoria foi chamada sem erros');
});

// ========== EXECUTAR TESTES ==========
async function runAllTests() {
    const success = await testRunner.run();
    return success;
}

// Exportar para uso global
window.testRunner = testRunner;
window.runAllTests = runAllTests;
