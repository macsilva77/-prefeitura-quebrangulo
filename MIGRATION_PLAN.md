# 📋 Plano de Migração - Sistema Prefeitura Quebrangulo
## Transformação para Produção com Boas Práticas

**Data de Início:** 27 de Janeiro de 2026  
**Versão Atual:** MVP com localStorage  
**Versão Alvo:** Sistema completo com backend e banco de dados

---

## 🎯 Objetivos da Migração

1. **Segurança:** Implementar autenticação real e proteção de dados
2. **Escalabilidade:** Backend robusto com API REST
3. **Persistência:** Banco de dados PostgreSQL
4. **Manutenibilidade:** Código organizado e documentado
5. **Performance:** Otimizações e cache
6. **Qualidade:** Testes automatizados

---

## 📊 Arquitetura Atual vs Nova

### Atual (MVP)
```
Frontend (HTML/CSS/JS)
    └── localStorage (dados locais)
```

### Nova Arquitetura
```
Frontend (HTML/CSS/JS)
    └── API REST (Express.js)
        └── Banco de Dados (PostgreSQL)
        └── Autenticação (JWT)
        └── Validações
```

---

## 🗂️ Estrutura de Pastas Proposta

```
expense-tracker/
├── frontend/                    # Código do cliente
│   ├── src/
│   │   ├── assets/
│   │   ├── css/
│   │   ├── js/
│   │   │   ├── api/            # Services para API
│   │   │   ├── components/     # Componentes reutilizáveis
│   │   │   ├── utils/          # Utilitários
│   │   │   └── pages/          # Lógica por página
│   │   └── pages/              # HTML
│   └── dist/                    # Build otimizado
│
├── backend/                     # API Node.js
│   ├── src/
│   │   ├── controllers/        # Lógica de negócio
│   │   ├── models/             # Modelos do banco
│   │   ├── routes/             # Rotas da API
│   │   ├── middlewares/        # Auth, validação, etc
│   │   ├── services/           # Serviços
│   │   ├── config/             # Configurações
│   │   └── utils/              # Utilitários
│   ├── tests/                   # Testes
│   └── prisma/                  # Migrations e schema
│
├── docker/                      # Configuração Docker
├── docs/                        # Documentação
└── scripts/                     # Scripts utilitários
```

---

## 📝 FASE 1: Configuração do Backend (2-3 dias)

### 1.1 Inicializar Projeto Node.js
- [x] Criar pasta `backend/`
- [ ] Inicializar npm: `npm init -y`
- [ ] Instalar dependências principais:
  ```bash
  npm install express cors dotenv bcrypt jsonwebtoken
  npm install pg sequelize
  npm install -D nodemon typescript @types/node
  ```

### 1.2 Configurar TypeScript
- [ ] Criar `tsconfig.json`
- [ ] Configurar scripts de build
- [ ] Configurar ESLint e Prettier

### 1.3 Estrutura Básica
- [ ] Criar arquivo principal `src/server.ts`
- [ ] Configurar Express
- [ ] Configurar CORS
- [ ] Configurar middleware de erros
- [ ] Criar arquivo `.env` com variáveis

**Entregável:** Servidor Express rodando na porta 3000

---

## 📝 FASE 2: Banco de Dados (2-3 dias)

### 2.1 Configurar PostgreSQL
- [ ] Instalar PostgreSQL local ou Docker
- [ ] Criar database `prefeitura_quebrangulo`
- [ ] Configurar conexão no backend

### 2.2 Definir Schema
**Tabelas principais:**

#### `usuarios`
```sql
id, nome, email, senha_hash, perfil, ativo, created_at, updated_at
```

#### `fornecedores`
```sql
id, cnpj, razao_social, nome_fantasia, telefone, email, endereco, 
cidade, estado, cep, ativo, created_at, updated_at
```

#### `secretarias`
```sql
id, nome, sigla, responsavel, telefone, email, orcamento_anual, 
ativo, created_at, updated_at
```

#### `verbas`
```sql
id, secretaria_id, nome, valor_total, valor_utilizado, 
data_inicio, data_fim, status, created_at, updated_at
```

#### `despesas`
```sql
id, fornecedor_id, secretaria_id, verba_id, valor, descricao,
data_despesa, nota_fiscal, status, created_at, updated_at
```

### 2.3 Criar Models com Sequelize
- [ ] Model Usuario
- [ ] Model Fornecedor
- [ ] Model Secretaria
- [ ] Model Verba
- [ ] Model Despesa
- [ ] Definir relacionamentos

### 2.4 Migrations
- [ ] Migration inicial para todas as tabelas
- [ ] Seeds com dados de teste
- [ ] Script para popular admin padrão

**Entregável:** Banco estruturado e populado

---

## 📝 FASE 3: Autenticação JWT (1-2 dias)

### 3.1 Sistema de Auth
- [ ] Middleware de autenticação
- [ ] Middleware de autorização (roles)
- [ ] Hash de senhas com bcrypt
- [ ] Geração de tokens JWT
- [ ] Refresh tokens

### 3.2 Rotas de Auth
```
POST /api/auth/login          # Login
POST /api/auth/register       # Registro
POST /api/auth/refresh        # Refresh token
POST /api/auth/logout         # Logout
GET  /api/auth/me             # Usuário atual
POST /api/auth/forgot         # Esqueci senha
POST /api/auth/reset/:token   # Resetar senha
```

### 3.3 Segurança
- [ ] Rate limiting
- [ ] Sanitização de inputs
- [ ] Proteção contra SQL injection
- [ ] Headers de segurança (helmet)
- [ ] CORS configurado

**Entregável:** Sistema de autenticação funcional

---

## 📝 FASE 4: API REST Completa (3-4 dias)

### 4.1 Rotas de Fornecedores
```
GET    /api/fornecedores          # Listar (com paginação)
GET    /api/fornecedores/:id      # Buscar por ID
POST   /api/fornecedores          # Criar
PUT    /api/fornecedores/:id      # Atualizar
DELETE /api/fornecedores/:id      # Deletar (soft delete)
GET    /api/fornecedores/cnpj/:cnpj  # Buscar por CNPJ
```

### 4.2 Rotas de Secretarias
```
GET    /api/secretarias
GET    /api/secretarias/:id
POST   /api/secretarias
PUT    /api/secretarias/:id
DELETE /api/secretarias/:id
GET    /api/secretarias/:id/verbas     # Verbas da secretaria
GET    /api/secretarias/:id/despesas   # Despesas da secretaria
```

### 4.3 Rotas de Verbas
```
GET    /api/verbas
GET    /api/verbas/:id
POST   /api/verbas
PUT    /api/verbas/:id
DELETE /api/verbas/:id
GET    /api/verbas/:id/saldo          # Saldo disponível
```

### 4.4 Rotas de Usuários (Admin)
```
GET    /api/usuarios
GET    /api/usuarios/:id
POST   /api/usuarios
PUT    /api/usuarios/:id
DELETE /api/usuarios/:id
PUT    /api/usuarios/:id/toggle       # Ativar/Desativar
```

### 4.5 Rotas de Dashboard
```
GET    /api/dashboard/stats           # Estatísticas gerais
GET    /api/dashboard/charts          # Dados para gráficos
GET    /api/dashboard/recent          # Atividades recentes
```

### 4.6 Validações
- [ ] Joi ou Zod para validação de schemas
- [ ] Validações customizadas
- [ ] Mensagens de erro padronizadas

**Entregável:** API REST completa e documentada

---

## 📝 FASE 5: Refatoração do Frontend (3-4 dias)

### 5.1 Criar Service Layer
**Arquivo:** `frontend/src/js/api/apiClient.js`
```javascript
class ApiClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
    this.token = null;
  }
  
  async request(endpoint, options = {}) {
    // Implementação com fetch + interceptors
  }
  
  setToken(token) { /* ... */ }
  get(url) { /* ... */ }
  post(url, data) { /* ... */ }
  put(url, data) { /* ... */ }
  delete(url) { /* ... */ }
}
```

### 5.2 Services Específicos
- [ ] `authService.js` - Login, logout, registro
- [ ] `fornecedorService.js` - CRUD fornecedores
- [ ] `secretariaService.js` - CRUD secretarias
- [ ] `verbaService.js` - CRUD verbas
- [ ] `usuarioService.js` - CRUD usuários
- [ ] `dashboardService.js` - Dados dashboard

### 5.3 Refatorar Páginas
- [ ] `login.html` → usar authService
- [ ] `dashboard.html` → usar dashboardService
- [ ] `fornecedores.html` → usar fornecedorService
- [ ] `secretarias.html` → usar secretariaService
- [ ] `verbas.html` → usar verbaService
- [ ] `usuarios.html` → usar usuarioService

### 5.4 Estado Global
- [ ] Implementar gerenciamento de estado simples
- [ ] Armazenar token no sessionStorage
- [ ] Listener para expiração de token
- [ ] Redirect automático ao deslogar

### 5.5 Tratamento de Erros
- [ ] Toast/notifications para feedback
- [ ] Loading states
- [ ] Tratamento de erros de rede
- [ ] Retry automático

**Entregável:** Frontend consumindo API

---

## 📝 FASE 6: Features Avançadas (2-3 dias)

### 6.1 Upload de Arquivos
- [ ] Multer no backend
- [ ] Upload de notas fiscais
- [ ] Upload de documentos
- [ ] Validação de tipos de arquivo
- [ ] Armazenamento (local ou S3)

### 6.2 Relatórios
- [ ] Geração de PDF (pdfmake)
- [ ] Exportação Excel (xlsx)
- [ ] Relatórios personalizados
- [ ] Filtros avançados

### 6.3 Logs e Auditoria
- [ ] Tabela de logs
- [ ] Registro de todas as ações
- [ ] Relatório de auditoria
- [ ] Histórico de alterações

### 6.4 Notificações
- [ ] Sistema de notificações
- [ ] Email (nodemailer)
- [ ] Alertas de verbas esgotando

**Entregável:** Features completas

---

## 📝 FASE 7: Testes (2-3 dias)

### 7.1 Testes Backend
- [ ] Configurar Jest
- [ ] Testes unitários dos models
- [ ] Testes unitários dos services
- [ ] Testes de integração das rotas
- [ ] Mock do banco de dados
- [ ] Cobertura > 80%

### 7.2 Testes Frontend
- [ ] Configurar Vitest
- [ ] Testes dos services
- [ ] Testes de componentes
- [ ] Testes E2E com Playwright

### 7.3 CI/CD
- [ ] GitHub Actions
- [ ] Testes automáticos em PRs
- [ ] Deploy automático

**Entregável:** Suíte de testes completa

---

## 📝 FASE 8: Otimização e Deploy (2-3 dias)

### 8.1 Performance Frontend
- [ ] Configurar Vite/Webpack
- [ ] Minificação JS/CSS
- [ ] Tree shaking
- [ ] Code splitting
- [ ] Lazy loading de rotas
- [ ] Otimização de imagens

### 8.2 Performance Backend
- [ ] Indices no banco
- [ ] Query optimization
- [ ] Redis para cache
- [ ] Compressão gzip
- [ ] CDN para assets

### 8.3 Docker
- [ ] Dockerfile backend
- [ ] Dockerfile frontend
- [ ] docker-compose.yml completo
- [ ] Ambiente de desenvolvimento
- [ ] Ambiente de produção

### 8.4 Deploy Produção
- [ ] Backend na Railway/Render
- [ ] Frontend no Vercel
- [ ] PostgreSQL na Supabase/Neon
- [ ] Variáveis de ambiente
- [ ] Domínio customizado
- [ ] SSL/HTTPS
- [ ] Monitoring (Sentry)

**Entregável:** Sistema em produção otimizado

---

## 📝 FASE 9: Documentação (1-2 dias)

### 9.1 Documentação Técnica
- [ ] README.md atualizado
- [ ] API documentation (Swagger/OpenAPI)
- [ ] JSDoc nos arquivos
- [ ] Guia de contribuição
- [ ] Guia de setup local

### 9.2 Documentação de Usuário
- [ ] Manual do usuário
- [ ] Vídeos tutoriais
- [ ] FAQ
- [ ] Troubleshooting

**Entregável:** Documentação completa

---

## 📝 FASE 10: Manutenção e Melhorias

### 10.1 Monitoramento
- [ ] Logs centralizados
- [ ] Alertas de erros
- [ ] Métricas de uso
- [ ] Performance monitoring

### 10.2 Backups
- [ ] Backup automático do banco
- [ ] Estratégia de recovery
- [ ] Testes de restore

### 10.3 Melhorias Contínuas
- [ ] Análise de feedback
- [ ] Novas features
- [ ] Otimizações
- [ ] Atualizações de segurança

---

## 📊 Cronograma Estimado

| Fase | Duração | Dependências |
|------|---------|--------------|
| 1. Backend Config | 2-3 dias | - |
| 2. Banco de Dados | 2-3 dias | Fase 1 |
| 3. Autenticação | 1-2 dias | Fase 1, 2 |
| 4. API REST | 3-4 dias | Fase 2, 3 |
| 5. Refatoração Frontend | 3-4 dias | Fase 4 |
| 6. Features Avançadas | 2-3 dias | Fase 5 |
| 7. Testes | 2-3 dias | Todas anteriores |
| 8. Otimização/Deploy | 2-3 dias | Todas anteriores |
| 9. Documentação | 1-2 dias | Todas anteriores |
| **TOTAL** | **18-27 dias** | - |

---

## 🔧 Tecnologias Utilizadas

### Backend
- **Runtime:** Node.js 20+
- **Framework:** Express.js
- **Linguagem:** TypeScript
- **Banco:** PostgreSQL 15+
- **ORM:** Sequelize ou Prisma
- **Auth:** JWT + bcrypt
- **Validação:** Joi ou Zod
- **Testes:** Jest + Supertest

### Frontend
- **Base:** HTML5, CSS3, JavaScript ES6+
- **Bundler:** Vite
- **HTTP Client:** Fetch API
- **Testes:** Vitest + Playwright

### DevOps
- **Container:** Docker + Docker Compose
- **CI/CD:** GitHub Actions
- **Hosting Backend:** Railway/Render
- **Hosting Frontend:** Vercel
- **Banco Produção:** Supabase/Neon
- **Monitoring:** Sentry

---

## ✅ Checklist de Qualidade

### Código
- [ ] ESLint configurado e sem erros
- [ ] Prettier formatando automaticamente
- [ ] Código comentado (JSDoc)
- [ ] Sem console.logs em produção
- [ ] Variáveis de ambiente documentadas

### Segurança
- [ ] Senhas com hash bcrypt
- [ ] Tokens JWT seguros
- [ ] Rate limiting ativo
- [ ] Sanitização de inputs
- [ ] HTTPS em produção
- [ ] Secrets não commitados

### Performance
- [ ] Assets minificados
- [ ] Imagens otimizadas
- [ ] Queries otimizadas
- [ ] Cache implementado
- [ ] Lazy loading ativo

### Testes
- [ ] Cobertura > 80%
- [ ] Testes passando em CI
- [ ] Testes E2E críticos
- [ ] Performance tests

### Deploy
- [ ] Ambiente de staging
- [ ] Rollback strategy
- [ ] Backups automáticos
- [ ] Monitoring ativo
- [ ] Logs centralizados

---

## 🚀 Próximos Passos Imediatos

1. ✅ Criar este documento
2. ⏳ Criar estrutura de pastas do backend
3. ⏳ Inicializar projeto Node.js
4. ⏳ Configurar PostgreSQL
5. ⏳ Criar primeiro endpoint de teste

---

## 📞 Notas e Decisões

### Por que PostgreSQL?
- Robusto para dados relacionais
- Excelente performance
- ACID compliant
- Gratuito em produção (Supabase/Neon)

### Por que Express?
- Mais maduro e estável
- Grande comunidade
- Middleware ecosystem rico
- Fácil integração

### Por que Manter HTML/CSS/JS Vanilla?
- Já está funcionando
- Mais leve
- Sem complexidade de frameworks
- Rápido para pequenas alterações

### Alternativas Consideradas
- **NestJS:** Muito complexo para o escopo
- **Fastify:** Menor ecossistema
- **React/Vue:** Overkill para este projeto

---

## 📚 Recursos e Referências

- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [JWT.io](https://jwt.io/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [REST API Design Guide](https://restfulapi.net/)

---

**Documento criado em:** 27/01/2026  
**Última atualização:** 27/01/2026  
**Versão:** 1.0  
**Autor:** GitHub Copilot + Michael Alessander
