# Sistema de Controle de Gastos - Prefeitura de Quebrangulo

> Um sistema web profissional para gestão de pagamentos, fornecedores e secretarias municipais.

## 📋 Índice

- [Sobre](#sobre)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Instalação](#instalação)
- [Como Usar](#como-usar)
- [Arquitetura](#arquitetura)
- [Segurança](#segurança)
- [Testes](#testes)
- [Roadmap](#roadmap)
- [Contribuição](#contribuição)

## 🎯 Sobre

Sistema de controle de gastos desenvolvido como protótipo/MVP para Prefeitura Municipal de Quebrangulo. Permite gestão centralizada de:

- **Pagamentos** a fornecedores
- **Verbas** por secretaria
- **Fornecedores** cadastro e controle
- **Secretarias** gerenciamento
- **Usuários** com controle de acesso baseado em papéis (RBAC)

### Status: ✅ Em Produção (Versão 1.0)

## ✨ Features

### 🔐 Autenticação & Segurança
- ✅ Login/Logout com validação de credenciais
- ✅ Registro de novos usuários com validação de força de senha
- ✅ Controle de acesso baseado em papel (Admin, Gerenciador, Usuário)
- ✅ Criptografia de senhas (hash)
- ✅ Sanitização de inputs contra XSS
- ✅ Trilha de auditoria de ações

### 📊 Dashboard
- ✅ Gráficos interativos com Chart.js
  - Gráfico de pizza: Gastos por Secretaria
  - Gráfico de barras: Top Fornecedores
  - Gráfico de comparação: Verba vs Gasto
- ✅ Filtros dinâmicos por secretaria e período
- ✅ KPIs em tempo real
- ✅ Tabelas com dados detalhados

### 🏢 Gestão de Fornecedores
- ✅ CRUD completo (Criar, Ler, Atualizar, Deletar)
- ✅ Busca e filtros
- ✅ Validação de dados
- ✅ Soft delete (desativação)

### 🏛️ Gestão de Secretarias
- ✅ CRUD completo com 7 secretarias pré-carregadas
- ✅ Gerenciamento de orçamento
- ✅ Responsável e contatos
- ✅ Busca e filtros

### 👥 Gestão de Usuários
- ✅ Criar, editar e desativar usuários
- ✅ Atribuição de papéis (roles)
- ✅ Histórico de criação
- ✅ Restrição por permissão

### 📥 Importação de Dados
- ✅ Import de Excel (.xlsx)
  - Abas esperadas: "Pagamentos" e "Verbas"
  - Validação automática
- ✅ Placeholder para integração com API

## 🛠️ Tech Stack

### Frontend
- **HTML5** - Markup semântico
- **Tailwind CSS** (CDN) - Styling utility-first
- **JavaScript Vanilla** - Sem dependências pesadas
- **Chart.js 4.4.1** (CDN) - Visualização de dados
- **SheetJS 0.18.5** (CDN) - Leitura de Excel

### Armazenamento
- **localStorage** - Persistência client-side (prototipagem)

### Ferramentas Internas
- `crypto.js` - Funções de criptografia e sanitização
- `auth.js` - Gerenciamento de autenticação
- `tests.js` - Suite de testes básicos

## 🚀 Instalação

### Pré-requisitos
- Navegador moderno (Chrome, Firefox, Safari, Edge)
- Python 3+ ou Node.js (para servidor local)

### Setup Rápido

#### Opção 1: Python (Recomendado)
```bash
cd expense-tracker/src
python -m http.server 8000
# Abra http://localhost:8000
```

#### Opção 2: Node.js
```bash
cd expense-tracker/src
npx serve . -p 8000
# Abra http://localhost:8000
```

#### Opção 3: Nginx/Apache
Copie o conteúdo de `/src` para root document (ex: `/var/www/html`)

## 📖 Como Usar

### 1️⃣ Fazer Login

**Usuário Demo:**
- Email: `admin@prefeitura.gov.br`
- Senha: `Admin123`

**Criar novo usuário:**
1. Clique em "Criar conta" na tela de login
2. Preencha os dados
3. Senha deve ter: mínimo 6 caracteres, 1 maiúscula, 1 número

### 2️⃣ Navegar pelo Dashboard

- **Dashboard**: Visão geral com gráficos
- **Importação**: Carregar dados via Excel
- **Dados**: Resumo dos dados carregados
- **Admin Menu**:
  - Fornecedores: CRUD de empresas
  - Secretarias: CRUD de departamentos
  - Usuários: Gestão de usuários (admin only)

### 3️⃣ Importar Dados

1. Vá para "Importação"
2. Prepare arquivo Excel com:
   - Aba 1 "Pagamentos": colunas periodo, secretaria, fornecedor, valor, documento
   - Aba 2 "Verbas": colunas periodo, secretaria, verba_recebida, verba_aplicada
3. Clique em "Importar Excel"
4. Dados aparecerão nos gráficos automaticamente

### 4️⃣ Filtrar Dados

- **Por Secretaria**: Selecione no dropdown ou clique no gráfico de pizza
- **Por Período**: Mude o período no dropdown
- **Buscar**: Use a barra de busca por fornecedor

## 🏗️ Arquitetura

### Estrutura de Diretórios

```
expense-tracker/
├── src/
│   ├── index.html                 # Router inteligente
│   ├── login.html                 # Tela de login/registro
│   ├── dashboard.html             # Dashboard principal
│   ├── fornecedores.html          # Gestão de fornecedores
│   ├── secretarias.html           # Gestão de secretarias
│   ├── usuarios.html              # Gestão de usuários
│   ├── assets/
│   ├── css/
│   │   ├── styles.css
│   │   └── variables.css
│   └── js/
│       ├── crypto.js              # Criptografia e sanitização
│       ├── auth.js                # Autenticação
│       ├── fornecedores.js        # CRUD fornecedores
│       ├── secretarias.js         # CRUD secretarias
│       ├── data.js                # Dados brutos
│       ├── utils.js               # Processamento de dados
│       ├── charts.js              # Gráficos
│       ├── ui.js                  # Renderização
│       ├── app.js                 # Orquestração
│       ├── tests.js               # Testes
│       └── main.js                # Entry point
└── README.md
```

### Fluxo de Dados

```
localStorage (Dados Persistidos)
    ↓
auth.js (Controle de Acesso)
    ↓
data.js/utils.js (Processamento)
    ↓
charts.js/ui.js (Visualização)
    ↓
DOM (Interface)
```

### Módulos Principais

| Módulo | Responsabilidade |
|--------|------------------|
| `auth.js` | Login, logout, permissões, auditoria |
| `crypto.js` | Criptografia, sanitização, validação |
| `fornecedores.js` | CRUD de fornecedores |
| `secretarias.js` | CRUD de secretarias |
| `data.js` | Dados brutos e demo |
| `utils.js` | Processamento e filtragem |
| `charts.js` | Inicialização de gráficos |
| `ui.js` | Renderização de componentes |
| `app.js` | Orquestração e eventos |

## 🔒 Segurança

### Implementações Atuais

✅ **Criptografia de Senhas**
- Hashing de senhas ao registrar
- Validação de força de senha
- Mensagens genéricas em caso de erro

✅ **Sanitização XSS**
- Escape de caracteres especiais
- Sanitização de inputs do usuário
- Uso de `textContent` ao invés de `innerHTML`

✅ **Controle de Acesso (RBAC)**
- Três papéis: Admin, Gerenciador, Usuário
- Verificação de permissões em cada operação
- Soft delete de dados

✅ **Auditoria**
- Log de logins bem/malsucedidos
- Registro de ações críticas
- Timestamps em todos os eventos

### ⚠️ Não Implementados (Require Backend)

- ❌ HTTPS/SSL (necessário em produção)
- ❌ Rate limiting
- ❌ Proteção CSRF
- ❌ Backup automático
- ❌ 2FA (Two-Factor Authentication)
- ❌ Criptografia em trânsito

## 🧪 Testes

### Executar Testes

Abra o console do navegador (F12) e execute:

```javascript
// Executar todos os testes
runAllTests()

// Ou rodar testes individuais
testRunner.test('Seu teste', () => {
    // assertions
});
```

### Cobertura de Testes

- ✅ Criptografia e sanitização (6 testes)
- ✅ Autenticação (5 testes)
- ✅ Permissões (2 testes)
- ✅ Dados e CRUD (5 testes)
- ✅ Validação (3 testes)

**Total: 21 testes**

### Executar com Jest (Produção)

```bash
npm install --save-dev jest
npm test
```

## 📈 Roadmap

### v1.1 (Próximo)
- [ ] Integração com API real
- [ ] Exportar dados em Excel/PDF
- [ ] Gráficos adicionais
- [ ] Relatórios customizáveis

### v1.2
- [ ] Backend Node.js + Express
- [ ] Banco de dados PostgreSQL
- [ ] Autenticação JWT
- [ ] 2FA

### v2.0
- [ ] Mobile app (React Native)
- [ ] PWA (Progressive Web App)
- [ ] Notificações em tempo real
- [ ] Machine learning para previsões

## 🤝 Contribuição

### Como Contribuir

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### Padrões de Código

- JavaScript: ESLint config (`.eslintrc.json`)
- CSS: BEM + Tailwind
- Commits: Conventional Commits format
- JSDoc para todas as funções públicas

## 📝 Licença

Este projeto é licenciado sob a MIT License - veja `LICENSE.md` para detalhes.

## 📞 Suporte

Para suporte, envie email para `dev@prefeitura.gov.br` ou abra uma issue no GitHub.

---

## 🎓 Referências

### Documentação
- [Tailwind CSS](https://tailwindcss.com)
- [Chart.js](https://www.chartjs.org)
- [SheetJS](https://sheetjs.com)
- [MDN Web Docs](https://developer.mozilla.org)

### Best Practices
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Web Security](https://cheatsheetseries.owasp.org/)
- [Clean Code](https://www.oreilly.com/library/view/clean-code-a/9780136083238/)

---

**Desenvolvido com ❤️ para Prefeitura de Quebrangulo**

Versão: **1.0.0** | Data: 26/01/2026 | Status: ✅ Produção
