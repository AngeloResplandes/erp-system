# 🏢 ERP System

Sistema de Gestão Empresarial completo desenvolvido com as tecnologias mais modernas do mercado. Uma solução full-stack para gerenciar clientes, produtos, vendas, fornecedores e finanças do seu negócio.

![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19.2.3-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql)
![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-0.45-C5F74F?style=flat-square)

## 📋 Índice

- [Funcionalidades](#-funcionalidades)
- [Stack Tecnológica](#-stack-tecnológica)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação](#-instalação)
- [Configuração do Banco de Dados](#-configuração-do-banco-de-dados)
- [Executando o Projeto](#-executando-o-projeto)
- [Modelo de Dados](#-modelo-de-dados)
- [APIs Disponíveis](#-apis-disponíveis)
- [Autenticação](#-autenticação)
- [Screenshots](#-screenshots)

## ✨ Funcionalidades

### 📊 Dashboard
- Visão geral com estatísticas do negócio
- Resumo de clientes, produtos e vendas
- Alertas de estoque baixo
- Gráficos interativos de vendas
- Vendas recentes e produtos mais vendidos
- Resumo financeiro (contas a pagar/receber)

### 👥 Gestão de Clientes
- Cadastro completo de clientes (nome, email, telefone, CPF/CNPJ)
- Endereço completo (cidade, estado, CEP)
- Listagem com busca e filtros
- Edição e desativação de clientes

### 📦 Controle de Produtos
- Cadastro de produtos com categorias
- Preço de custo e preço de venda
- Controle de estoque com alertas de estoque mínimo
- Suporte a código de barras
- Gerenciamento de categorias

### 🛒 PDV (Ponto de Venda)
- Interface moderna para vendas
- Busca de produtos em tempo real
- Seleção de cliente
- Múltiplas formas de pagamento (Dinheiro, PIX, Cartão Crédito/Débito, Boleto)
- Aplicação de descontos
- Histórico de vendas

### 🚚 Fornecedores
- Cadastro de fornecedores com CNPJ
- Informações de contato
- Gerenciamento de relacionamento

### 💰 Financeiro
- **Contas a Pagar**: Gestão de despesas e pagamentos a fornecedores
- **Contas a Receber**: Controle de recebimentos de clientes
- Filtros por status (pendente, pago, atrasado, cancelado)
- Alertas de vencimento

### 📈 Relatórios
- Análise de vendas por período
- Produtos mais vendidos
- Performance por forma de pagamento
- Gráficos interativos com Recharts

### 🎨 Interface
- Design moderno e responsivo
- Modo claro/escuro
- Componentes Shadcn UI
- Sidebar retrátil
- Totalmente responsivo para mobile

## 🛠 Stack Tecnológica

### Frontend
| Tecnologia | Versão | Descrição |
|------------|--------|-----------|
| **Next.js** | 16.1.6 | Framework React com App Router |
| **React** | 19.2.3 | Biblioteca UI |
| **TypeScript** | 5.x | Tipagem estática |
| **Tailwind CSS** | 4.x | Framework CSS utilitário |
| **Shadcn UI** | 3.8.4 | Componentes UI acessíveis |
| **Lucide React** | 0.563.0 | Biblioteca de ícones |
| **Recharts** | 3.7.0 | Gráficos interativos |
| **TanStack Query** | 5.90.20 | Gerenciamento de estado server-side |
| **React Hook Form** | 7.71.1 | Formulários performáticos |
| **Zod** | 4.3.6 | Validação de schemas |

### Backend
| Tecnologia | Versão | Descrição |
|------------|--------|-----------|
| **Next.js API Routes** | - | API RESTful integrada |
| **Drizzle ORM** | 0.45.1 | ORM TypeScript-first |
| **PostgreSQL** | 16 | Banco de dados relacional |
| **Jose** | 6.1.3 | Biblioteca JWT |
| **Bcrypt.js** | 3.0.3 | Hash de senhas |

### DevOps
| Tecnologia | Descrição |
|------------|-----------|
| **Docker** | Containerização do banco |
| **ESLint** | Linting de código |
| **Drizzle Kit** | Migrations e seeding |

## 📁 Estrutura do Projeto

```
erp-project/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Grupo de rotas de autenticação
│   │   ├── login/                # Página de login
│   │   └── register/             # Página de registro
│   ├── (dashboard)/              # Grupo de rotas do dashboard
│   │   ├── layout.tsx            # Layout com sidebar
│   │   └── dashboard/
│   │       ├── clientes/         # Gestão de clientes
│   │       ├── produtos/         # Gestão de produtos
│   │       ├── fornecedores/     # Gestão de fornecedores
│   │       ├── vendas/           # PDV e histórico
│   │       ├── financeiro/       # Contas a pagar/receber
│   │       ├── relatorios/       # Relatórios e gráficos
│   │       └── configuracoes/    # Configurações do sistema
│   ├── api/                      # API Routes
│   │   ├── auth/                 # Endpoints de autenticação
│   │   ├── clientes/             # CRUD de clientes
│   │   ├── produtos/             # CRUD de produtos
│   │   ├── categorias/           # CRUD de categorias
│   │   ├── fornecedores/         # CRUD de fornecedores
│   │   ├── vendas/               # CRUD de vendas
│   │   ├── financeiro/           # Contas a pagar/receber
│   │   └── dashboard/            # Estatísticas
│   ├── layout.tsx                # Layout raiz
│   └── page.tsx                  # Landing page
├── components/
│   ├── ui/                       # 24 componentes Shadcn UI
│   │   ├── avatar.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── form.tsx
│   │   ├── sidebar.tsx
│   │   ├── table.tsx
│   │   └── ...
│   ├── layout/
│   │   └── app-sidebar.tsx       # Sidebar principal
│   ├── mode-toggle.tsx           # Toggle tema claro/escuro
│   └── theme-provider.tsx        # Provider de tema
├── contexts/
│   ├── auth-context.tsx          # Contexto de autenticação
│   └── query-provider.tsx        # Provider TanStack Query
├── db/
│   ├── index.ts                  # Conexão com banco
│   ├── schema.ts                 # Schema Drizzle (8 tabelas)
│   └── seed.ts                   # Dados de seed
├── hooks/
│   └── use-mobile.ts             # Hook detecção mobile
├── lib/
│   ├── auth.ts                   # Funções de autenticação JWT
│   ├── utils.ts                  # Utilitários (cn)
│   └── validations.ts            # Schemas Zod
├── styles/
│   └── globals.css               # Estilos globais + Tailwind
├── docker-compose.yml            # Configuração Docker PostgreSQL
├── drizzle.config.ts             # Configuração Drizzle Kit
├── package.json
├── tsconfig.json
└── next.config.ts
```

## 📋 Pré-requisitos

- **Node.js** >= 18.0.0
- **npm** ou **bun**
- **Docker** (para PostgreSQL) ou PostgreSQL instalado localmente
- **Git**

## 🚀 Instalação

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/erp-project.git
cd erp-project
```

2. **Instale as dependências**
```bash
npm install
# ou
bun install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
```

Edite o arquivo `.env`:
```env
# Database
DATABASE_URL="postgresql://erp_user:erp_secret@localhost:5432/erp_database"

# Auth
JWT_SECRET="sua-chave-secreta-super-segura-mude-em-producao"
```

## 🗄 Configuração do Banco de Dados

### Usando Docker (Recomendado)

1. **Inicie o container PostgreSQL**
```bash
docker-compose up -d
```

Isso criará um container com:
- **Usuário**: erp_user
- **Senha**: erp_secret
- **Banco**: erp_database
- **Porta**: 5432

2. **Execute as migrations**
```bash
npx drizzle-kit push
```

3. **Popule o banco com dados de exemplo (opcional)**
```bash
npm run db:seed
```

### Sem Docker

Se você tem PostgreSQL instalado localmente:

1. Crie um banco de dados
2. Atualize a `DATABASE_URL` no `.env`
3. Execute as migrations e seed

## ▶️ Executando o Projeto

### Desenvolvimento
```bash
npm run dev
```
Acesse: [http://localhost:3000](http://localhost:3000)

### Produção
```bash
npm run build
npm run start
```

## 📊 Modelo de Dados

O sistema possui 8 tabelas principais:

```mermaid
erDiagram
    USUARIOS ||--o{ VENDAS : realiza
    CLIENTES ||--o{ VENDAS : compra
    CLIENTES ||--o{ CONTAS_RECEBER : deve
    CATEGORIAS ||--o{ PRODUTOS : contém
    PRODUTOS ||--o{ ITENS_VENDA : incluído
    VENDAS ||--o{ ITENS_VENDA : contém
    VENDAS ||--o{ CONTAS_RECEBER : gera
    FORNECEDORES ||--o{ CONTAS_PAGAR : recebe
```

### Tabelas

| Tabela | Descrição |
|--------|-----------|
| `usuarios` | Usuários do sistema com roles (admin, gerente, vendedor) |
| `clientes` | Clientes com dados completos e endereço |
| `categorias` | Categorias de produtos |
| `produtos` | Produtos com preços, estoque e código de barras |
| `fornecedores` | Fornecedores com CNPJ e contato |
| `vendas` | Vendas com status, pagamento e totais |
| `itens_venda` | Itens individuais de cada venda |
| `contas_pagar` | Contas a pagar para fornecedores |
| `contas_receber` | Contas a receber de clientes |

### Enums

- **user_role**: `admin`, `gerente`, `vendedor`
- **venda_status**: `aberta`, `finalizada`, `cancelada`
- **forma_pagamento**: `dinheiro`, `pix`, `cartao_credito`, `cartao_debito`, `boleto`
- **conta_status**: `pendente`, `pago`, `atrasado`, `cancelado`

## 🔗 APIs Disponíveis

### Autenticação
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/register` | Registro |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Usuário atual |

### Clientes
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/clientes` | Listar clientes |
| POST | `/api/clientes` | Criar cliente |
| GET | `/api/clientes/[id]` | Buscar cliente |
| PUT | `/api/clientes/[id]` | Atualizar cliente |
| DELETE | `/api/clientes/[id]` | Remover cliente |

### Produtos
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/produtos` | Listar produtos |
| POST | `/api/produtos` | Criar produto |
| GET | `/api/produtos/[id]` | Buscar produto |
| PUT | `/api/produtos/[id]` | Atualizar produto |
| DELETE | `/api/produtos/[id]` | Remover produto |

### Vendas
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/vendas` | Listar vendas |
| POST | `/api/vendas` | Criar venda |
| GET | `/api/vendas/[id]` | Buscar venda |

### Financeiro
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/financeiro/pagar` | Contas a pagar |
| POST | `/api/financeiro/pagar` | Criar conta a pagar |
| GET | `/api/financeiro/receber` | Contas a receber |
| POST | `/api/financeiro/receber` | Criar conta a receber |

### Dashboard
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/dashboard` | Estatísticas gerais |
| GET | `/api/relatorios` | Dados para relatórios |

## 🔐 Autenticação

O sistema utiliza autenticação baseada em **JWT (JSON Web Tokens)**:

- **Tokens** são armazenados em cookies HTTP-only
- **Expiração** de 7 dias
- **Senhas** são hasheadas com bcrypt (12 rounds)
- **Middleware** protege rotas autenticadas

### Roles de Usuário

| Role | Permissões |
|------|-----------|
| **admin** | Acesso total ao sistema |
| **gerente** | Gestão de vendas, clientes, produtos |
| **vendedor** | Realização de vendas e consultas |

## 📱 Screenshots

### Landing Page
- Design moderno com gradientes
- Apresentação das funcionalidades
- Botões de acesso e registro

### Dashboard
- Cards com estatísticas principais
- Gráficos de vendas
- Vendas recentes e produtos mais vendidos

### PDV
- Interface intuitiva para vendas
- Busca de produtos
- Carrinho de compras

### Modo Escuro
- Suporte completo a tema escuro
- Transições suaves

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request
