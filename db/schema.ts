import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

// ==================== USUARIOS ====================
export const usuarios = sqliteTable('usuarios', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    nome: text('nome').notNull(),
    email: text('email').notNull().unique(),
    senhaHash: text('senha_hash').notNull(),
    role: text('role', { enum: ['admin', 'gerente', 'vendedor'] }).notNull().default('vendedor'),
    ativo: integer('ativo', { mode: 'boolean' }).notNull().default(true),
    criadoEm: integer('criado_em', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
    atualizadoEm: integer('atualizado_em', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const usuariosRelations = relations(usuarios, ({ many }) => ({
    vendas: many(vendas),
}));

// ==================== CLIENTES ====================
export const clientes = sqliteTable('clientes', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    nome: text('nome').notNull(),
    email: text('email'),
    telefone: text('telefone'),
    cpfCnpj: text('cpf_cnpj').unique(),
    endereco: text('endereco'),
    cidade: text('cidade'),
    estado: text('estado'),
    cep: text('cep'),
    ativo: integer('ativo', { mode: 'boolean' }).notNull().default(true),
    criadoEm: integer('criado_em', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
    atualizadoEm: integer('atualizado_em', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const clientesRelations = relations(clientes, ({ many }) => ({
    vendas: many(vendas),
    contasReceber: many(contasReceber),
}));

// ==================== CATEGORIAS ====================
export const categorias = sqliteTable('categorias', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    nome: text('nome').notNull(),
    descricao: text('descricao'),
    criadoEm: integer('criado_em', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const categoriasRelations = relations(categorias, ({ many }) => ({
    produtos: many(produtos),
}));

// ==================== PRODUTOS ====================
export const produtos = sqliteTable('produtos', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    nome: text('nome').notNull(),
    descricao: text('descricao'),
    categoriaId: integer('categoria_id').references(() => categorias.id),
    precoCusto: text('preco_custo').notNull().default('0'),
    precoVenda: text('preco_venda').notNull(),
    estoqueAtual: integer('estoque_atual').notNull().default(0),
    estoqueMinimo: integer('estoque_minimo').notNull().default(5),
    codigoBarras: text('codigo_barras').unique(),
    ativo: integer('ativo', { mode: 'boolean' }).notNull().default(true),
    criadoEm: integer('criado_em', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
    atualizadoEm: integer('atualizado_em', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const produtosRelations = relations(produtos, ({ one, many }) => ({
    categoria: one(categorias, {
        fields: [produtos.categoriaId],
        references: [categorias.id],
    }),
    itensVenda: many(itensVenda),
}));

// ==================== FORNECEDORES ====================
export const fornecedores = sqliteTable('fornecedores', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    nome: text('nome').notNull(),
    cnpj: text('cnpj').unique(),
    telefone: text('telefone'),
    email: text('email'),
    endereco: text('endereco'),
    ativo: integer('ativo', { mode: 'boolean' }).notNull().default(true),
    criadoEm: integer('criado_em', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const fornecedoresRelations = relations(fornecedores, ({ many }) => ({
    contasPagar: many(contasPagar),
}));

// ==================== VENDAS ====================
export const vendas = sqliteTable('vendas', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    clienteId: integer('cliente_id').references(() => clientes.id),
    usuarioId: integer('usuario_id').references(() => usuarios.id).notNull(),
    dataVenda: integer('data_venda', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
    status: text('status', { enum: ['aberta', 'finalizada', 'cancelada'] }).notNull().default('aberta'),
    subtotal: text('subtotal').notNull().default('0'),
    desconto: text('desconto').notNull().default('0'),
    total: text('total').notNull().default('0'),
    formaPagamento: text('forma_pagamento', { enum: ['dinheiro', 'pix', 'cartao_credito', 'cartao_debito', 'boleto'] }),
    observacoes: text('observacoes'),
    criadoEm: integer('criado_em', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
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
export const itensVenda = sqliteTable('itens_venda', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    vendaId: integer('venda_id').references(() => vendas.id).notNull(),
    produtoId: integer('produto_id').references(() => produtos.id).notNull(),
    quantidade: integer('quantidade').notNull(),
    precoUnitario: text('preco_unitario').notNull(),
    desconto: text('desconto').notNull().default('0'),
    subtotal: text('subtotal').notNull(),
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
export const contasPagar = sqliteTable('contas_pagar', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    descricao: text('descricao').notNull(),
    valor: text('valor').notNull(),
    dataVencimento: text('data_vencimento').notNull(),
    dataPagamento: text('data_pagamento'),
    status: text('status', { enum: ['pendente', 'pago', 'atrasado', 'cancelado'] }).notNull().default('pendente'),
    fornecedorId: integer('fornecedor_id').references(() => fornecedores.id),
    categoria: text('categoria'),
    criadoEm: integer('criado_em', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const contasPagarRelations = relations(contasPagar, ({ one }) => ({
    fornecedor: one(fornecedores, {
        fields: [contasPagar.fornecedorId],
        references: [fornecedores.id],
    }),
}));

// ==================== CONTAS A RECEBER ====================
export const contasReceber = sqliteTable('contas_receber', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    clienteId: integer('cliente_id').references(() => clientes.id),
    vendaId: integer('venda_id').references(() => vendas.id),
    valor: text('valor').notNull(),
    dataVencimento: text('data_vencimento').notNull(),
    dataRecebimento: text('data_recebimento'),
    status: text('status', { enum: ['pendente', 'pago', 'atrasado', 'cancelado'] }).notNull().default('pendente'),
    criadoEm: integer('criado_em', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
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
