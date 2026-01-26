# Guia de Contribuição

Obrigado por considerar contribuir para o Sistema de Controle de Gastos! Este documento fornece diretrizes e instruções para contribuir.

## 📋 Código de Conduta

- Seja respeitoso e inclusivo
- Evite linguagem ofensiva ou discriminatória
- Foque em discussões construtivas
- Reporte abuso para os mantenedores

## 🐛 Reportar Bugs

Antes de criar um report de bug, verifique a [issue list](https://github.com/seu-repo/issues) para evitar duplicatas.

**Como reportar um bug:**

1. **Use um título claro e descritivo**
2. **Descreva os passos exatos para reproduzir o problema**
3. **Forneça exemplos específicos** para demonstrar os passos
4. **Descreva o comportamento observado** e o que estava esperando
5. **Inclua screenshots/logs** se possível
6. **Mencione sua configuração** (navegador, SO, versão)

### Template de Bug Report

```markdown
**Descrição do Bug**
[Descrição clara e concisa]

**Passos para Reproduzir**
1. Vá para '...'
2. Clique em '...'
3. Rolle até '...'
4. Veja o erro

**Comportamento Esperado**
[O que deveria acontecer]

**Comportamento Atual**
[O que realmente aconteceu]

**Screenshots**
[Se aplicável]

**Ambiente**
- Navegador: [ex. Chrome 120]
- SO: [ex. Windows 11]
- Versão: [ex. 1.0.0]
```

## ✨ Sugerir Melhorias

Sugestões de melhorias são sempre bem-vindas! Incluem:

- Novos recursos
- Melhorias de performance
- Melhorias de design/UX
- Documentação melhor

**Como sugerir uma melhoria:**

1. Use um **título claro e descritivo**
2. Forneça uma **descrição detalhada** da melhoria
3. Liste **exemplos específicos** para demonstrar os passos
4. Explique por que isso **melhoraria o projeto**

## 🔧 Desenvolvimento

### Pré-requisitos

- Node.js 14+ ou Python 3+
- Git
- Um editor de código (VS Code recomendado)

### Setup Local

1. **Fork o repositório**
   ```bash
   git clone https://github.com/seu-usuario/expense-tracker.git
   cd expense-tracker
   ```

2. **Crie uma branch para sua feature**
   ```bash
   git checkout -b feature/sua-feature
   # ou para bugfix
   git checkout -b fix/seu-bug
   ```

3. **Instale dependências** (se houver)
   ```bash
   npm install
   # ou
   pip install -r requirements.txt
   ```

4. **Inicie o servidor local**
   ```bash
   cd src
   python -m http.server 8000
   # ou
   npx serve . -p 8000
   ```

5. **Abra no navegador**
   ```
   http://localhost:8000
   ```

### Padrões de Código

#### JavaScript

```javascript
/**
 * Descrição concisa da função
 * @param {type} paramName - Descrição do parâmetro
 * @returns {type} Descrição do retorno
 */
function myFunction(paramName) {
    // Use const/let, não var
    const result = doSomething();
    
    // Use === em comparações
    if (result === null) {
        return null;
    }
    
    return result;
}
```

**Regras:**
- Use `const` por padrão, `let` se necessário, nunca `var`
- Sempre use `===` e `!==`
- Indentação: 4 espaços
- Nomes em camelCase
- JSDoc para funções públicas
- Máximo 80 caracteres por linha

#### HTML

```html
<!-- Use semantic HTML -->
<article class="card">
    <h2 class="card-title">Título</h2>
    <p class="card-description">Descrição</p>
</article>
```

**Regras:**
- Use tags semânticas (`<article>`, `<section>`, etc)
- Classes: kebab-case
- IDs reservados para JavaScript

#### CSS

```css
/* Usar Tailwind quando possível */
.custom-component {
    @apply flex justify-center items-center gap-4;
}

.custom-component:hover {
    @apply shadow-lg;
}
```

**Regras:**
- Prefira classes Tailwind
- Se custom CSS: BEM naming
- Variáveis CSS para cores/espaçamento
- Mobile-first approach

### Commits

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: Nova feature
- `fix`: Correção de bug
- `docs`: Documentação
- `style`: Formatação (sem lógica)
- `refactor`: Refatoração de código
- `perf`: Melhorias de performance
- `test`: Testes
- `chore`: Build, deps, etc

**Exemplos:**

```
feat(auth): adicionar validação de senha forte

fix(dashboard): corrigir gráfico de pizza não renderizando

docs(readme): atualizar instruções de instalação

chore(deps): atualizar Chart.js para 4.4.1
```

### Testes

Antes de fazer push, verifique se os testes passam:

```bash
# Rodar testes
npm test
# ou
npm run test:watch

# Cobertura
npm run test:coverage
```

**Escrevendo Testes:**

```javascript
testRunner.test('Descrição do teste', () => {
    // Arrange
    const input = 'valor';
    
    // Act
    const result = myFunction(input);
    
    // Assert
    testRunner.assertEquals(result, 'esperado');
});
```

## 📝 Pull Request

### Antes de Submeter

1. **Atualize sua branch com main**
   ```bash
   git fetch origin
   git rebase origin/main
   ```

2. **Rode testes localmente**
   ```bash
   npm test
   ```

3. **Verifique se o código passa o linter**
   ```bash
   npm run lint
   ```

4. **Build se necessário**
   ```bash
   npm run build
   ```

### Template de PR

```markdown
## Descrição
[Descreva suas mudanças aqui]

## Tipo de Mudança
- [ ] Bug fix (muda algo que estava quebrado)
- [ ] Nova feature (muda algo existente)
- [ ] Breaking change (muda funcionalidade existente)

## Relacionado a Issues
Fecha #[issue number]

## Mudanças Propostas
- [x] Mudança 1
- [x] Mudança 2

## Checklist
- [ ] Testei as mudanças localmente
- [ ] Adicionei testes para novas funcionalidades
- [ ] Atualizei documentação
- [ ] Meu código segue o style guide
- [ ] Revisei minhas mudanças

## Screenshots (se aplicável)
[Coloque screenshots aqui]
```

## 📚 Documentação

Ao adicionar features, atualize a documentação:

- `README.md` - Descrição geral
- `CONTRIBUTING.md` - Este arquivo
- Inline comments - Para código complexo
- JSDoc - Para funções públicas

## 🎓 Aprendendo o Projeto

### Arquivo de Partida
Comece lendo:
1. `README.md` - Visão geral
2. `src/js/app.js` - Entry point
3. `src/js/auth.js` - Autenticação

### Estrutura
- `src/` - Código frontend
- `src/js/` - Scripts JavaScript
- `src/css/` - Estilos CSS
- `tests/` - Testes (futuro)
- `docs/` - Documentação (futuro)

## ❓ Dúvidas?

- 📧 Email: dev@prefeitura.gov.br
- 💬 Discussões: [GitHub Discussions](https://github.com/seu-repo/discussions)
- 📖 Documentação: [Wiki](https://github.com/seu-repo/wiki)

---

**Obrigado por contribuir!** 🎉

Suas contribuições fazem este projeto melhor para todos.
