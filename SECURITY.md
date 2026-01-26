# Política de Segurança

## Divulgação Responsável de Vulnerabilidades

Se você descobrir uma vulnerabilidade de segurança, **não abra uma issue pública**. Em vez disso, envie um email para `security@prefeitura.gov.br` com os seguintes detalhes:

1. **Descrição da vulnerabilidade**
2. **Passos para reproduzir** (se possível)
3. **Potencial impacto**
4. **Sugestão de correção** (se tiver)

Você receberá uma resposta dentro de **48 horas**.

## 🔒 Padrões de Segurança

### Criptografia

- ✅ **Implementado**: Hash de senhas (SHA-256 com salt)
- ⚠️ **TODO**: Migrar para bcrypt (requer backend)
- ⚠️ **TODO**: HTTPS obrigatório em produção
- ⚠️ **TODO**: Criptografia de dados em repouso

### Autenticação

- ✅ Validação de credenciais
- ✅ Sessão com timeout
- ⚠️ **TODO**: JWT (JSON Web Tokens)
- ⚠️ **TODO**: 2FA (Two-Factor Authentication)
- ⚠️ **TODO**: Biometria

### Validação & Sanitização

- ✅ Validação de emails
- ✅ Validação de força de senha
- ✅ Sanitização contra XSS
- ✅ Validação de inputs
- ⚠️ **TODO**: CSRF tokens
- ⚠️ **TODO**: Rate limiting
- ⚠️ **TODO**: WAF (Web Application Firewall)

### Controle de Acesso

- ✅ RBAC (Role-Based Access Control)
- ✅ Soft delete (dados não perdidos)
- ⚠️ **TODO**: Auditoria detalhada
- ⚠️ **TODO**: Logs criptografados

### Armazenamento

- ✅ localStorage (protegido por Same-Origin Policy)
- ⚠️ **TODO**: Backup automático
- ⚠️ **TODO**: Criptografia de backup
- ⚠️ **TODO**: Retenção de dados configurável

## 🚨 Problemas Conhecidos

### Crítico
- ❌ Senhas ainda em plain text no localStorage (use server-side hashing)
- ❌ Sem HTTPS em desenvolvimento

### Alto
- ⚠️ Sem proteção rate limiting
- ⚠️ Sem tokens CSRF
- ⚠️ Sem backup automático

### Médio
- ⚠️ Sem auditoria detalhada
- ⚠️ Sem 2FA
- ⚠️ Sem PWA offline support

### Baixo
- ℹ️ Logs não são comprimidos
- ℹ️ Sem limpeza automática de logs antigos

## ✅ Checklist de Segurança

- [ ] Alterar credenciais demo antes de produção
- [ ] Implementar backend com bcrypt
- [ ] Configurar HTTPS/SSL
- [ ] Adicionar rate limiting
- [ ] Implementar CSRF tokens
- [ ] Adicionar 2FA
- [ ] Configurar backups
- [ ] Adicionar logs criptografados
- [ ] Implementar WAF
- [ ] Testes de penetração
- [ ] Conformidade LGPD/GDPR
- [ ] Política de privacidade
- [ ] Terms of Service

## 🛡️ Boas Práticas

### Para Usuários

1. **Altere a senha demo**
   - Email: admin@prefeitura.gov.br
   - Senha padrão: Admin123

2. **Use senhas fortes**
   - Mínimo 6 caracteres
   - Com maiúscula e número
   - Não reutilize senhas

3. **Logout após usar**
   - Clique em "Sair" sempre
   - Limpe cache do navegador em PCs compartilhados

4. **Use HTTPS**
   - Sempre acesse via HTTPS em produção
   - Não use HTTP em redes públicas

### Para Desenvolvedores

1. **Never commit secrets**
   ```bash
   # Use .env files
   # Nunca commit .env com valores reais
   ```

2. **Validate inputs**
   ```javascript
   const email = sanitizeInput(userInput);
   if (!validateEmail(email)) {
       return error;
   }
   ```

3. **Check permissions**
   ```javascript
   if (!temPermissao('criar')) {
       return { erro: 'Acesso negado' };
   }
   ```

4. **Use HTTPS**
   ```javascript
   if (location.protocol !== 'https:' && !isLocal()) {
       location.protocol = 'https:';
   }
   ```

5. **Log eventos críticos**
   ```javascript
   logAudit('ACAO_CRITICA', { dados });
   ```

## 📋 Conformidade

### LGPD (Lei Geral de Proteção de Dados)
- [ ] Coleta consentida de dados
- [ ] Direito ao acesso
- [ ] Direito à correção
- [ ] Direito ao esquecimento
- [ ] Direito à portabilidade

### GDPR (General Data Protection Regulation)
- [ ] Privacy by design
- [ ] Data protection impact assessment
- [ ] Data retention policies
- [ ] Direitos do titular dos dados

### PCI DSS (Payment Card Industry)
- [ ] Criptografia em trânsito
- [ ] Armazenamento seguro
- [ ] Validação de entrada
- [ ] Restricao de acesso

## 🔍 Testes de Segurança

### Ferramentas Recomendadas

1. **OWASP ZAP** - Teste de penetração
   ```bash
   docker run -t owasp/zap2docker-stable zap-baseline.py -t http://localhost:8000
   ```

2. **Snyk** - Verificação de vulnerabilidades
   ```bash
   npm install -g snyk
   snyk test
   ```

3. **Lighthouse** - Auditoria de segurança
   - Chrome DevTools → Lighthouse

### Teste Manual

1. **XSS Testing**
   ```javascript
   // Tente: <img src=x onerror="alert('XSS')">
   // Deve ser escapado
   ```

2. **SQL Injection** (quando tiver DB)
   ```
   ' OR '1'='1
   -- comentário
   ```

3. **CSRF** - Verificar tokens
4. **Rate Limiting** - Múltiplas requisições rápidas

## 📞 Contato

**Security Team**: security@prefeitura.gov.br
**Resposta Time**: 48 horas

---

**Última atualização**: 26/01/2026
**Versão**: 1.0
**Status**: 🟡 Necessita melhorias para produção
