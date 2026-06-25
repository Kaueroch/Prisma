# 💎 Prisma Dashboard

**Live Demo:** [Em breve] | **Deploy:** VPS (Containers Docker)
**Status:** 🚧 Em Desenvolvimento (Front-end concluído, Back-end em roadmap)

## 📌 O Problema
O controle de finanças pessoais frequentemente sofre com interfaces engessadas ou planilhas difíceis de manter. O Prisma centraliza a gestão de receitas e despesas em uma interface fluida, permitindo visualizar rapidamente a saúde do fluxo de caixa e tomar decisões ágeis.

## 🏗️ Decisões Arquiteturais
A stack foi escolhida com foco em paridade entre desenvolvimento e produção, priorizando integridade de dados financeiros:

* **Backend (Java/Spring Boot):** Maturidade em segurança (Spring Security/JWT) e estabilidade para o core financeiro.
* **Frontend (Angular):** Organização estrutural forte e tipagem estrita (TypeScript) para manipulação de estados na interface.
* **Banco de Dados (PostgreSQL):** Integridade transacional (ACID) estrita, essencial para lidar com saldos e transações.
* **Infraestrutura (Docker):** Conteinerização desde o dia zero para garantir deploys previsíveis e sem fricção na VPS.

### 🗄️ Entidades do Sistema (Banco de Dados)
A API foi projetada de forma relacional, conectando as seguintes entidades:
* **Usuários:** Dados de acesso (protegidos com Hash Bcrypt) e gerenciamento de sessões Stateless.
* **Categorias:** Sistema de labels personalizadas (tags) para agrupar as finanças.
* **Transações:** O núcleo do sistema. Entradas (Receitas) ou saídas (Despesas), obrigatoriamente vinculadas a um Usuário e a uma Categoria.

## ⚙️ Setup Local

Todo o ecossistema da aplicação foi conteinerizado. Você não precisa instalar dependências (como Java ou Node.js) diretamente na sua máquina para testar o projeto.

### Pré-requisitos
* Git
* Docker e Docker Compose

### Passos para Inicialização

**1. Clone o repositório**
```bash
git clone https://github.com/seu-usuario/prisma-dashboard.git
cd prisma-dashboard
```

**2. Configure as Variáveis de Ambiente**
Faça uma cópia do arquivo de exemplo para criar o seu arquivo de ambiente local:
```bash
cp .env.example .env
```
*(Abra o arquivo `.env` gerado e preencha as variáveis padrão, como as credenciais do banco de dados e a secret key do JWT).*

**3. Build e Execução**
Suba toda a infraestrutura com um único comando:
```bash
docker compose up --build -d
```

**Acessando a aplicação:**
* **Dashboard (Frontend Angular):** `http://localhost:4200`
* **API REST (Backend Spring):** `http://localhost:8080`

## 🛣️ Roadmap Técnico
O projeto é iterativo. Abaixo estão as etapas de desenvolvimento:

- [x] Design UI/UX e interface Angular desenvolvidos.
- [ ] Construção da API (Spring Boot) e persistência (PostgreSQL).
- [ ] Implementação de Autenticação e Autorização (Spring Security).
- [ ] Deploy do banco de dados e API na VPS.
- [ ] Deploy do frontend na Vercel (ou similar).

---
*Projeto desenvolvido para portfólio e uso pessoal, com foco em boas práticas de engenharia de software.*