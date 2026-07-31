# Prisma Dashboard

**Status:** 🚧 Em Desenvolvimento (Front-end concluído, Back-end em progresso)

## Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| **Frontend** | React 19 + TypeScript + Vite 6 |
| **Estilização** | Tailwind CSS 4 + shadcn/ui |
| **Ícones** | Lucide React |
| **Gráficos** | Recharts |
| **Animações** | Motion (Framer Motion) |
| **Backend** | Java / Spring Boot (em desenvolvimento) |
| **Banco** | PostgreSQL 15 |
| **Infra** | Docker + Docker Compose |

## Sistema de Transações

O gerenciamento financeiro do Prisma é composto por:

### 📊 Dashboard
- Visão geral com **saldo atual**, receitas totais, despesas totais e economia líquida
- **Gráfico donut** de gastos por categoria (Recharts)
- **Tabela de atividade recente** com as últimas transações
- **Seletor de mês** para filtrar os dados por período

### 💳 Transações
- **Registro** de receitas e despesas com valor (formato BRL), descrição, data e categoria
- **Visualização** em cards agrupados por categoria com total e maior gasto
- **Filtros**: busca por texto, filtro por categoria e por tipo (receita/despesa)
- **Expansão** de cada categoria para ver detalhes das transações

### 📋 Orçamentos
- Definição de **limites mensais** por categoria
- **Barra de progresso** comparando gasto atual vs limite definido
- Alertas visuais quando o orçamento é ultrapassado

### 🏷️ Categorias
- **CRUD completo**: criar, editar, renomear e excluir categorias
- Personalização com **cores** para identificação visual
- Categorias padrão: Alimentação, Transporte, Compras, Contas, Salário

### 🎯 Metas
- Definição de **objetivos financeiros** com valor alvo e economia mensal
- **Progresso** com barra e estimativa de meses restantes
- Status visual de meta alcançada

### 👥 CRM de Contatos
- Cadastro de **clientes, leads, parceiros e fornecedores**
- Busca por nome, email ou empresa
- Classificação por tipo com badges

## Como Executar

### Pré-requisitos
- Docker e Docker Compose

### Passos

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/prisma-dashboard.git
cd prisma-dashboard

# Configure variáveis de ambiente
cp .env.example .env

# Suba a infraestrutura
docker compose up --build -d
```

### Acessos
- **Frontend (dev):** `http://localhost:3000`
- **Frontend (prod):** `http://localhost:80`
- **API (Spring Boot):** `http://localhost:8080`
- **API (desenvolvimento):** `http://localhost:3333`
- **Banco (PostgreSQL):** `localhost:5432`
