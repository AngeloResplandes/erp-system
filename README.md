# ERP Project

Um sistema completo de Planejamento de Recursos Empresariais (ERP) desenvolvido com tecnologias modernas para gestão eficiente de vendas, estoque, financeiro e relacionamento com clientes.

![Status do Projeto](https://img.shields.io/badge/status-em_desenvolvimento-orange)
![Next.js](https://img.shields.io/badge/Next.js-16.1-black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791)
![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-0.31-C5F74F)

## 🚀 Tecnologias Utilizadas

Este projeto utiliza uma stack moderna e robusta focada em performance e experiência do desenvolvedor:

- **Frontend & Framework:** [Next.js 16](https://nextjs.org/) (App Router) e [React 19](https://react.dev/).
- **Estilização:** [Tailwind CSS v4](https://tailwindcss.com/) com [Shadcn/ui](https://ui.shadcn.com/) para componentes acessíveis.
- **Banco de Dados & ORM:** [PostgreSQL](https://www.postgresql.org/) com [Drizzle ORM](https://orm.drizzle.team/) para tipagem segura e queries eficientes.
- **Autenticação:** Implementação customizada com `jose` (JWT) e `bcryptjs`.
- **Formulários & Validação:** [React Hook Form](https://react-hook-form.com/) e [Zod](https://zod.dev/).
- **Visualização de Dados:** [Recharts](https://recharts.org/) para gráficos e dashboards.
- **Gerenciamento de Estado/Cache:** [TanStack Query](https://tanstack.com/query/latest).
- **Manipulação de Datas:** [date-fns](https://date-fns.org/).

## ✨ Funcionalidades Principais

O sistema está dividido em módulos integrados para cobrir as principais áreas de gestão:

### 📦 Gestão de Estoque e Produtos
- Cadastro completo de produtos com categorização.
- Controle de estoque atual e estoque mínimo.
- Gestão de preços de custo e venda.
- Código de barras.

### 💰 Gestão Financeira
- **Contas a Pagar:** Controle de despesas e pagamentos a fornecedores.
- **Contas a Receber:** Rastreamento de receitas vindas das vendas.
- Status financeiros claros (Pendente, Pago, Atrasado, Cancelado).

### 🛒 Vendas e PDV
- Registro de vendas vinculado a clientes e vendedores.
- Múltiplas formas de pagamento (Dinheiro, PIX, Cartão, Boleto).
- Cálculo automático de subtotal, descontos e total.
- Histórico de vendas.

### 🤝 CRM (Clientes e Fornecedores)
- Cadastro detalhado de clientes (Pessoa Física/Jurídica) e fornecedores.
- Histórico de compras e pagamentos por cliente.

### 🔐 Controle de Acesso
- Sistema de usuários com permissões baseadas em cargos (Admin, Gerente, Vendedor).

## 📂 Estrutura do Projeto

```bash
erp-project/
├── app/
│   ├── (auth)/       # Rotas de autenticação (login, cadastro)
│   ├── (dashboard)/  # Área protegida do sistema (painéis, listagens)
│   └── api/          # API Routes (se aplicável)
├── components/       # Componentes de UI reutilizáveis
├── db/               # Configuração do banco de dados e schema
│   ├── schema.ts     # Definição das tabelas e relações
│   └── seed.ts       # Script para popular o banco com dados iniciais
├── lib/              # Funções utilitárias
└── public/           # Arquivos estáticos
```

## 🛠️ Instalação e Execução

### Pré-requisitos
- Node.js (v20 ou superior)
- Banco de dados PostgreSQL rodando localmente ou na nuvem (recomenda-se Neon ou Docker).

### Passo a Passo

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/seu-usuario/erp-project.git
   cd erp-project
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   # ou
   bun install
   ```

3. **Configure as variáveis de ambiente:**
   Crie um arquivo `.env` na raiz do projeto baseado no `.env.example` e adicione a URL do seu banco de dados:
   ```env
   DATABASE_URL="postgresql://user:password@host:port/database"
   ```

4. **Prepare o Banco de Dados:**
   Gere as migrações e aplique ao banco de dados:
   ```bash
   npx drizzle-kit generate
   npx drizzle-kit migrate
   # ou use o push para desenvolvimento rápido
   npx drizzle-kit push
   ```

5. **Popule o banco (Opcional):**
   Para inserir dados de teste (usuários, produtos, etc):
   ```bash
   npm run db:seed
   ```

6. **Execute o projeto:**
   ```bash
   npm run dev
   ```
   Acesse `http://localhost:3000` no seu navegador.

## 📜 Scripts Disponíveis

- `npm run dev`: Inicia o servidor de desenvolvimento.
- `npm run build`: Cria a build de produção otimizada.
- `npm run start`: Inicia o servidor de produção.
- `npm run lint`: Executa o ESLint para verificar problemas no código.
- `npm run db:seed`: Executa o script de seed para popular o banco.

---

Desenvolvido com ❤️ por [Seu Nome/Time].
