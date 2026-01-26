# Guia de Deployment

## 📋 Checklist Pré-Produção

### Segurança

- [ ] Alterar credenciais demo
  ```bash
  # Email: admin@prefeitura.gov.br
  # Senha padrão: Admin123
  # Nova senha deve ter: maiúscula, número, mínimo 12 caracteres
  ```

- [ ] Configurar HTTPS/SSL
  ```bash
  # Usar certificado válido (Let's Encrypt recomendado)
  # Redirecionar HTTP para HTTPS
  ```

- [ ] Configurar variáveis de ambiente
  ```bash
  cp .env.example .env
  # Editar .env com valores de produção
  ```

- [ ] Implementar backend (requer desenvolvimento)
  - Migrar de localStorage para banco de dados
  - Implementar bcrypt para hashing de senhas
  - Implementar JWT para autenticação
  - Implementar rate limiting

### Performance

- [ ] Minificar CSS/JS
  ```bash
  npm run build
  ```

- [ ] Configurar cache do navegador
  ```nginx
  # nginx
  cache_control: public, max-age=31536000
  ```

- [ ] Ativar compressão gzip
  ```nginx
  gzip on;
  gzip_types text/plain text/css application/json application/javascript;
  ```

### Testes

- [ ] Rodar testes locais
  ```bash
  npm test
  ```

- [ ] Teste de penetração (OWASP ZAP)
  ```bash
  docker run -t owasp/zap2docker-stable zap-baseline.py -t https://seu-dominio.com
  ```

- [ ] Lighthouse audit
  - Chrome DevTools → Lighthouse

## 🚀 Deployment

### Opção 1: Nginx

```nginx
server {
    listen 443 ssl http2;
    server_name seu-dominio.com;
    
    ssl_certificate /etc/ssl/certs/seu-certificado.crt;
    ssl_certificate_key /etc/ssl/private/sua-chave.key;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    root /var/www/expense-tracker/src;
    index index.html;
    
    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
    
    # Cache
    location ~* \.(js|css|png|jpg|jpeg|gif|ico)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Single page app
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' https: data: 'unsafe-inline' 'unsafe-eval';" always;
}

# Redirecionar HTTP para HTTPS
server {
    listen 80;
    server_name seu-dominio.com;
    return 301 https://$server_name$request_uri;
}
```

### Opção 2: Apache

```apache
<VirtualHost *:443>
    ServerName seu-dominio.com
    DocumentRoot /var/www/expense-tracker/src
    
    # SSL
    SSLEngine on
    SSLCertificateFile /etc/ssl/certs/seu-certificado.crt
    SSLCertificateKeyFile /etc/ssl/private/sua-chave.key
    
    # Rewrite
    <IfModule mod_rewrite.c>
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </IfModule>
    
    # Gzip
    <IfModule mod_deflate.c>
        AddOutputFilterByType DEFLATE text/html text/plain text/css text/javascript
    </IfModule>
    
    # Cache
    <FilesMatch "\.(jpg|jpeg|png|gif|js|css|ico)$">
        Header set Cache-Control "max-age=31536000, public"
    </FilesMatch>
    
    # Security
    Header set X-Frame-Options "SAMEORIGIN"
    Header set X-XSS-Protection "1; mode=block"
    Header set X-Content-Type-Options "nosniff"
    
    ErrorLog ${APACHE_LOG_DIR}/error.log
    CustomLog ${APACHE_LOG_DIR}/access.log combined
</VirtualHost>

<VirtualHost *:80>
    ServerName seu-dominio.com
    Redirect permanent / https://seu-dominio.com/
</VirtualHost>
```

### Opção 3: Docker

```dockerfile
# Dockerfile
FROM nginx:alpine

# Copiar arquivos
COPY src/ /usr/share/nginx/html/

# Copiar configuração nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/index.html || exit 1

EXPOSE 80
```

```bash
# docker-compose.yml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./src:/usr/share/nginx/html
      - ./ssl:/etc/nginx/ssl
    environment:
      - NGINX_HOST=seu-dominio.com
      - NGINX_PORT=80
    restart: always

  # Backend (futuro)
  api:
    image: seu-repo/expense-tracker-api:latest
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://...
      - JWT_SECRET=...
    restart: always
```

```bash
# Comandos
docker-compose up -d
docker-compose logs -f
docker-compose down
```

## 🔍 Monitoramento

### Logs

```bash
# Nginx
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# Aplicação (localStorage)
# Acessar console do navegador → logs de auditoria no localStorage
```

### Métricas

```bash
# CPU/Memória
htop

# Disco
df -h

# Conexões
netstat -tulpn | grep LISTEN
```

### Alertas

Configurar alertas para:
- Uso de CPU > 80%
- Uso de memória > 80%
- Disco > 90%
- Erro 5xx > 10/min
- Erro 4xx > 100/min

## 🔄 CI/CD

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Run tests
      run: npm test
    
    - name: Lint
      run: npm run lint:check
    
    - name: Build
      run: npm run build
    
    - name: Deploy to server
      uses: appleboy/ssh-action@master
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        key: ${{ secrets.SSH_KEY }}
        script: |
          cd /var/www/expense-tracker
          git pull origin main
          npm install
          npm run build
          systemctl restart nginx
```

## 📊 Backup & Recovery

### Backup Automático

```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/backups/expense-tracker"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup de arquivos
tar -czf $BACKUP_DIR/app_$DATE.tar.gz /var/www/expense-tracker/src

# Backup de banco de dados (quando migrar)
# pg_dump prefeitura > $BACKUP_DIR/db_$DATE.sql

# Manter apenas últimos 30 dias
find $BACKUP_DIR -name "app_*.tar.gz" -mtime +30 -delete

echo "Backup concluído: $BACKUP_DIR/app_$DATE.tar.gz"
```

```bash
# Adicionar ao crontab para rodar diariamente às 2AM
0 2 * * * /usr/local/bin/backup.sh
```

### Recovery

```bash
# Restaurar de backup
cd /var/www
tar -xzf /backups/expense-tracker/app_20260126_120000.tar.gz
chown -R www-data:www-data expense-tracker
systemctl restart nginx
```

## 🎯 Pós-Deployment

### Validações

- [ ] Site acessível via HTTPS
- [ ] Certificado SSL válido
- [ ] Redirect HTTP → HTTPS funcionando
- [ ] Login com credenciais demo funcionando
- [ ] Gráficos carregando corretamente
- [ ] Importação de Excel funcionando
- [ ] Sem erros no console

### Otimizações

- [ ] Minificação ativada
- [ ] Compressão gzip ativada
- [ ] Cache do navegador ativado
- [ ] CDN configurado (para assets)

### Monitoramento

- [ ] Alertas configurados
- [ ] Logs sendo coletados
- [ ] Métricas sendo rastreadas
- [ ] Backup automático configurado

## ⚠️ Problemas Comuns

### HTTPS não funciona

```bash
# Testar certificado
openssl s_client -connect seu-dominio.com:443

# Renovar com Let's Encrypt
certbot renew --dry-run
```

### Gráficos não carregam

- Verificar CORS
- Verificar permissões de arquivo
- Verificar console do navegador

### Performance lenta

- Ativar gzip
- Minificar assets
- Configurar cache
- Usar CDN

### Falhas de autenticação

- Verificar cookie/localStorage
- Verificar permissões de arquivo
- Verificar logs de erro

## 📞 Suporte

Para problemas em produção:
- Email: ops@prefeitura.gov.br
- Slack: #expense-tracker-ops
- Pagerduty: On-call engineering

---

**Última atualização**: 26/01/2026
**Versão**: 1.0.0
