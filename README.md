# Prisma - Dashboard Financeiro

## Status e Visão Geral

**Status Atual:** O projeto encontra-se atualmente apenas com o **front-end** desenvolvido, aguardando a integração com os endpoints do back-end para ser finalizado e disponibilizado no GitHub.

**Visão de Futuro:** Pretendo implementar o **back-end utilizando Java** para tornar a aplicação funcional e robusta. O objetivo é manter o projeto em constante atualização, servindo como um destaque no portfólio.

---

## Roadmap Técnico (Back-end)

A implementação será focada em robustez e segurança, utilizando **Java** e **Spring Boot**.

### Funcionalidades de Segurança
- **Autenticação e Autorização:**
    - Login e Cadastro de usuários.
    - Implementação de **Spring Security**.
    - Proteção de senhas com **Hash** (BCrypt).
    - Gerenciamento de sessões **Stateless** (via JWT).

### Funcionalidades Core
- **CRUD Financeiro:** Gestão completa de lançamentos para controle de gastos e receitas.

### Modelagem do Banco de Dados
- **Usuários:** Dados de acesso e perfil.
    - `cd_id`
    - `ds_email`
    - `nm_nome`
- **Categorias:** Sistema de labels personalizadas para os lançamentos.
    - `cd_id`
    - `nm_nome`
- **Transações:** Registro principal com os seguintes campos:
    - `cd_id`
    - **Tipo:** Identificação se é Receita ou Despesa.
    - **Categoria:** Vínculo com a tabela de categorias.
    - `ds_categoria_ID_Usuario`: ID do usuário que fez a transação.
    - **Descrição:** Texto explicativo do gasto/ganho.
    - **Data:** Quando a transação ocorreu.
    - **Valor:** Montante financeiro.

*Vai ser divertido codar esse projeto!*

---

## Distribuição e Portfólio

### Estratégia de Disponibilidade
O projeto tem como foco principal o aprendizado e a demonstração de competências técnicas.

- **GitHub:** O código-fonte completo estará disponível para a comunidade. Qualquer pessoa poderá baixar, rodar localmente ou usar como referência para seus próprios projetos.
- **Hospedagem (Vercel ou similar):** Manterei uma instância online para:
    - Uso pessoal no dia a dia.
    - Demonstração rápida no portfólio para recrutadores e interessados.

### Atualizações
O projeto será iterativo, com melhorias contínuas conforme o back-end for sendo desenvolvido e novas features de front-end forem surgindo.