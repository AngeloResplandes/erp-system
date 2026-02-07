import { pgTable, serial, text, varchar, timestamp, boolean, decimal, integer, pgEnum, date, PgTable } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const userRoleEnum = pgEnum('user_role', ['admin', 'gerente', 'vendedor']);
export const vendaStatusEnum = pgEnum('venda_status', ['aberta', 'finalizada', 'cancelada']);
export const formaPagamentoEnum = pgEnum('forma_pagamento', ['dinheiro', 'pix', 'cartao_credito', 'cartao_debito', 'boleto']);
export const contaStatusEnum = pgEnum('conta_status', ['pendente', 'pago', 'atrasado', 'cancelado']);

// ==================== USUARIOS ====================
export const usuarios = pgTable('usuarios', {
    id: serial('id').primaryKey(),
    nome: varchar('nome', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    senhaHash: text('senha_hash').notNull(),
    role: userRoleEnum('role').notNull().default('vendedor'),
    ativo: boolean('ativo').notNull().default(true),
    criadoEm: timestamp('criado_em').notNull().defaultNow(),
    atualizadoEm: timestamp('atualizado_em').notNull().defaultNow(),
});

export const usuariosRelations = relations(usuarios, ({ many }) => ({
    vendas: many(vendas),
}));

// ==================== CLIENTES ====================
export const clientes = pgTable('clientes', {
    id: serial('id').primaryKey(),
    nome: varchar('nome', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }),
    telefone: varchar('telefone', { length: 20 }),
    cpfCnpj: varchar('cpf_cnpj', { length: 18 }).unique(),
    endereco: text('endereco'),
    cidade: varchar('cidade', { length: 100 }),
    estado: varchar('estado', { length: 2 }),
    cep: varchar('cep', { length: 9 }),
    ativo: boolean('ativo').notNull().default(true),
    criadoEm: timestamp('criado_em').notNull().defaultNow(),
    atualizadoEm: timestamp('atualizado_em').notNull().defaultNow(),
});

export const clientesRelations = relations(clientes, ({ many }) => ({
    vendas: many(vendas),
    contasReceber: many(contasReceber),
}));

// ==================== CATEGORIAS ====================
export const categorias = pgTable('categorias', {
    id: serial('id').primaryKey(),
    nome: varchar('nome', { length: 100 }).notNull(),
    descricao: text('descricao'),
    criadoEm: timestamp('criado_em').notNull().defaultNow(),
});

export const categoriasRelations = relations(categorias, ({ many }) => ({
    produtos: many(produtos),
}));

// ==================== PRODUTOS ====================
export const produtos = pgTable('produtos', {
    id: serial('id').primaryKey(),
    nome: varchar('nome', { length: 255 }).notNull(),
    descricao: text('descricao'),
    categoriaId: integer('categoria_id').references(() => categorias.id),
    precoCusto: decimal('preco_custo', { precision: 10, scale: 2 }).notNull().default('0'),
    precoVenda: decimal('preco_venda', { precision: 10, scale: 2 }).notNull(),
    estoqueAtual: integer('estoque_atual').notNull().default(0),
    estoqueMinimo: integer('estoque_minimo').notNull().default(5),
    codigoBarras: varchar('codigo_barras', { length: 50 }).unique(),
    ativo: boolean('ativo').notNull().default(true),
    criadoEm: timestamp('criado_em').notNull().defaultNow(),
    atualizadoEm: timestamp('atualizado_em').notNull().defaultNow(),
});

export const produtosRelations = relations(produtos, ({ one, many }) => ({
    categoria: one(categorias, {
        fields: [produtos.categoriaId],
        references: [categorias.id],
    }),
    itensVenda: many(itensVenda),
}));

// ==================== FORNECEDORES ====================
export const fornecedores = pgTable('fornecedores', {
    id: serial('id').primaryKey(),
    nome: varchar('nome', { length: 255 }).notNull(),
    cnpj: varchar('cnpj', { length: 18 }).unique(),
    telefone: varchar('telefone', { length: 20 }),
    email: varchar('email', { length: 255 }),
    endereco: text('endereco'),
    ativo: boolean('ativo').notNull().default(true),
    criadoEm: timestamp('criado_em').notNull().defaultNow(),
});

export const fornecedoresRelations = relations(fornecedores, ({ many }) => ({
    contasPagar: many(contasPagar),
}));

// ==================== VENDAS ====================
export const vendas = pgTable('vendas', {
    id: serial('id').primaryKey(),
    clienteId: integer('cliente_id').references(() => clientes.id),
    usuarioId: integer('usuario_id').references(() => usuarios.id).notNull(),
    dataVenda: timestamp('data_venda').notNull().defaultNow(),
    status: vendaStatusEnum('status').notNull().default('aberta'),
    subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull().default('0'),
    desconto: decimal('desconto', { precision: 10, scale: 2 }).notNull().default('0'),
    total: decimal('total', { precision: 10, scale: 2 }).notNull().default('0'),
    formaPagamento: formaPagamentoEnum('forma_pagamento'),
    observacoes: text('observacoes'),
    criadoEm: timestamp('criado_em').notNull().defaultNow(),
});

export const vendasRelations = relations(vendas, ({ one, many }) => ({
    cliente: one(clientes, {
        fields: [vendas.clienteId],
        references: [clientes.id],
    }),
    usuario: one(usuarios, {
        fields: [vendas.usuarioId],
        references: [usuarios.id],
    }),
    itens: many(itensVenda),
    contasReceber: many(contasReceber),
}));

// ==================== ITENS VENDA ====================
export const itensVenda = pgTable('itens_venda', {
    id: serial('id').primaryKey(),
    vendaId: integer('venda_id').references(() => vendas.id).notNull(),
    produtoId: integer('produto_id').references(() => produtos.id).notNull(),
    quantidade: integer('quantidade').notNull(),
    precoUnitario: decimal('preco_unitario', { precision: 10, scale: 2 }).notNull(),
    desconto: decimal('desconto', { precision: 10, scale: 2 }).notNull().default('0'),
    subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull(),
});

export const itensVendaRelations = relations(itensVenda, ({ one }) => ({
    venda: one(vendas, {
        fields: [itensVenda.vendaId],
        references: [vendas.id],
    }),
    produto: one(produtos, {
        fields: [itensVenda.produtoId],
        references: [produtos.id],
    }),
}));

// ==================== CONTAS A PAGAR ====================
export const contasPagar = pgTable('contas_pagar', {
    id: serial('id').primaryKey(),
    descricao: varchar('descricao', { length: 255 }).notNull(),
    valor: decimal('valor', { precision: 10, scale: 2 }).notNull(),
    dataVencimento: date('data_vencimento').notNull(),
    dataPagamento: date('data_pagamento'),
    status: contaStatusEnum('status').notNull().default('pendente'),
    fornecedorId: integer('fornecedor_id').references(() => fornecedores.id),
    categoria: varchar('categoria', { length: 100 }),
    criadoEm: timestamp('criado_em').notNull().defaultNow(),
});

export const contasPagarRelations = relations(contasPagar, ({ one }) => ({
    fornecedor: one(fornecedores, {
        fields: [contasPagar.fornecedorId],
        references: [fornecedores.id],
    }),
}));

// ==================== CONTAS A RECEBER ====================
export const contasReceber = pgTable('contas_receber', {
    id: serial('id').primaryKey(),
    clienteId: integer('cliente_id').references(() => clientes.id),
    vendaId: integer('venda_id').references(() => vendas.id),
    valor: decimal('valor', { precision: 10, scale: 2 }).notNull(),
    dataVencimento: date('data_vencimento').notNull(),
    dataRecebimento: date('data_recebimento'),
    status: contaStatusEnum('status').notNull().default('pendente'),
    criadoEm: timestamp('criado_em').notNull().defaultNow(),
});

export const contasReceberRelations = relations(contasReceber, ({ one }) => ({
    cliente: one(clientes, {
        fields: [contasReceber.clienteId],
        references: [clientes.id],
    }),
    venda: one(vendas, {
        fields: [contasReceber.vendaId],
        references: [vendas.id],
    }),
}));

// Export types
export type Usuario = typeof usuarios.$inferSelect;
export type NovoUsuario = typeof usuarios.$inferInsert;
export type Cliente = typeof clientes.$inferSelect;
export type NovoCliente = typeof clientes.$inferInsert;
export type Categoria = typeof categorias.$inferSelect;
export type NovaCategoria = typeof categorias.$inferInsert;
export type Produto = typeof produtos.$inferSelect;
export type NovoProduto = typeof produtos.$inferInsert;
export type Fornecedor = typeof fornecedores.$inferSelect;
export type NovoFornecedor = typeof fornecedores.$inferInsert;
export type Venda = typeof vendas.$inferSelect;
export type NovaVenda = typeof vendas.$inferInsert;
export type ItemVenda = typeof itensVenda.$inferSelect;
export type NovoItemVenda = typeof itensVenda.$inferInsert;
export type ContaPagar = typeof contasPagar.$inferSelect;
export type NovaContaPagar = typeof contasPagar.$inferInsert;
export type ContaReceber = typeof contasReceber.$inferSelect;
export type NovaContaReceber = typeof contasReceber.$inferInsert;
