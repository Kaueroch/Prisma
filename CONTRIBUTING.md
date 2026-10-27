# Como contribuir

Obrigado por querer contribuir! Este guia explica como colaborar com o projeto de forma organizada.

## Antes de começar

- Procure nas [issues](../../issues) se já existe algo sobre o que você quer fazer.
- Para bugs e novas funcionalidades, abra uma issue usando os templates disponíveis e aguarde um retorno antes de começar a trabalhar.
- Mudanças pequenas (typos, documentação) podem ir direto em um PR.

## Configurando o ambiente

### Pré-requisitos
- Java 17
- Node.js (versão LTS)
- PostgreSQL
- Docker e Docker Compose (opcional, recomendado)

### Passo a passo
1. Faça um fork do repositório.
2. Clone o seu fork:
   ```bash
   git clone https://github.com/<seu-usuario>/<nome-do-repositorio>.git
   cd <nome-do-repositorio>
   ```
3. Suba o projeto (ajuste os comandos conforme o projeto):
   ```bash
   # Com Docker
   docker compose up -d

   # Ou manualmente
   # Back-end: ./mvnw spring-boot:run
   # Front-end: npm install && npm run dev
   ```

## Fluxo de contribuição

1. Crie uma branch a partir da `main`:
   ```bash
   git checkout -b tipo/descricao-curta
   ```
2. Faça as alterações e teste localmente.
3. Faça commits seguindo o padrão abaixo.
4. Envie a branch para o seu fork:
   ```bash
   git push origin tipo/descricao-curta
   ```
5. Abra um Pull Request para a `main` preenchendo o template.

## Nome das branches

Use o formato `tipo/descricao-curta`:

- `feat/cadastro-de-categorias`
- `fix/calculo-do-saldo`
- `docs/atualiza-readme`
- `refactor/service-de-transacoes`

## Padrão de commits

Seguimos o [Conventional Commits](https://www.conventionalcommits.org/pt-br/):

```
tipo: descrição curta no imperativo
```

Tipos mais usados:

| Tipo | Quando usar |
|------|-------------|
| `feat` | Nova funcionalidade |
| `fix` | Correção de bug |
| `docs` | Mudanças em documentação |
| `style` | Formatação, sem mudança de lógica |
| `refactor` | Refatoração sem mudar comportamento |
| `test` | Criação ou ajuste de testes |
| `chore` | Tarefas de manutenção e configuração |

Exemplo: `feat: adiciona filtro de transações por categoria`

## Padrões de código

- Mantenha o estilo do código já existente.
- Dê nomes claros a variáveis, métodos e componentes.
- Evite PRs grandes: prefira mudanças pequenas e focadas.
- Não inclua credenciais, senhas ou arquivos `.env` nos commits.

## Testes

- Rode os testes antes de abrir o PR.
- Adicione testes para novas funcionalidades e correções de bugs sempre que possível.

## Revisão

- Um mantenedor vai revisar o seu PR e pode pedir ajustes.
- Responda aos comentários e atualize a branch; não é preciso abrir um novo PR.
- Quando aprovado, o PR será integrado à `main`.

## Dúvidas

Abra uma issue descrevendo a sua dúvida. Toda contribuição, grande ou pequena, é bem-vinda!