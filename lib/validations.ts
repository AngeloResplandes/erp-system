import { z } from 'zod';

// ==================== AUTH ====================
export const loginSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

export const registerSchema = z.object({
    nome: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Senhas não conferem',
    path: ['confirmPassword'],
});

// ==================== CLIENTE ====================
export const clienteSchema = z.object({
    nome: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
    email: z.string().email('Email inválido').optional().or(z.literal('')),
    telefone: z.string().optional(),
    cpfCnpj: z.string().optional(),
    endereco: z.string().optional(),
    cidade: z.string().optional(),
    estado: z.string().max(2, 'Estado deve ter 2 caracteres').optional(),
    cep: z.string().optional(),
});

// ==================== CATEGORIA ====================
export const categoriaSchema = z.object({
    nome: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
    descricao: z.string().optional(),
});

// ==================== PRODUTO ====================
export const produtoSchema = z.object({
    nome: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
    descricao: z.string().optional(),
    categoriaId: z.number().optional().nullable(),
    precoCusto: z.string(),
    precoVenda: z.string(),
    estoqueAtual: z.number().int().default(0),
    estoqueMinimo: z.number().int().default(5),
    codigoBarras: z.string().optional(),
});

// ==================== FORNECEDOR ====================
export const fornecedorSchema = z.object({
    nome: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
    cnpj: z.string().optional(),
    telefone: z.string().optional(),
    email: z.string().email('Email inválido').optional().or(z.literal('')),
    endereco: z.string().optional(),
});

// ==================== VENDA ====================
export const itemVendaSchema = z.object({
    produtoId: z.number(),
    quantidade: z.number().min(1),
    precoUnitario: z.number(),
    desconto: z.number().default(0),
});

export const vendaSchema = z.object({
    clienteId: z.number().optional(),
    itens: z.array(itemVendaSchema).min(1, 'Adicione pelo menos um item'),
    formaPagamento: z.enum(['dinheiro', 'pix', 'cartao_credito', 'cartao_debito', 'boleto']),
    desconto: z.number().default(0),
    observacoes: z.string().optional(),
});

// ==================== CONTAS ====================
export const contaPagarSchema = z.object({
    descricao: z.string().min(2, 'Descrição obrigatória'),
    valor: z.string().transform((v) => parseFloat(v) || 0),
    dataVencimento: z.string(),
    fornecedorId: z.number().optional(),
    categoria: z.string().optional(),
});

export const contaReceberSchema = z.object({
    clienteId: z.number().optional(),
    vendaId: z.number().optional(),
    valor: z.string().transform((v) => parseFloat(v) || 0),
    dataVencimento: z.string(),
});

// Export types
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ClienteInput = z.infer<typeof clienteSchema>;
export type CategoriaInput = z.infer<typeof categoriaSchema>;
export type ProdutoInput = z.infer<typeof produtoSchema>;
export type FornecedorInput = z.infer<typeof fornecedorSchema>;
export type VendaInput = z.infer<typeof vendaSchema>;
export type ContaPagarInput = z.infer<typeof contaPagarSchema>;
export type ContaReceberInput = z.infer<typeof contaReceberSchema>;
