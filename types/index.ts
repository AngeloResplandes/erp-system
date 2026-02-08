// ==================== ENTIDADES ====================

import type {
    usuarios,
    clientes,
    categorias,
    produtos,
    fornecedores,
    vendas,
    itensVenda,
    contasPagar,
    contasReceber
} from '@/db/schema';

// Tipos inferidos do schema Drizzle
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

// ==================== TIPOS DE RESPOSTA API ====================

export interface PaginationInfo {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface ApiResponse<T> {
    data: T;
    error?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: PaginationInfo;
}

// ==================== TIPOS EXTENDIDOS ====================

export interface ProdutoComCategoria extends Produto {
    categoria?: Pick<Categoria, 'id' | 'nome'> | null;
}

export interface VendaCompleta extends Venda {
    cliente?: Cliente | null;
    usuario?: Pick<Usuario, 'id' | 'nome'>;
    itens?: (ItemVenda & { produto: Produto })[];
}

export interface ContaPagarComFornecedor extends ContaPagar {
    fornecedor?: Fornecedor | null;
}

export interface ContaReceberCompleta extends ContaReceber {
    cliente?: Cliente | null;
    venda?: Venda | null;
}

// ==================== TIPOS DE FORMULÁRIO ====================

export interface ClienteFormData {
    nome: string;
    email: string;
    telefone: string;
    cpfCnpj: string;
    endereco: string;
    cidade: string;
    estado: string;
    cep: string;
}

export interface ProdutoFormData {
    nome: string;
    descricao: string;
    categoriaId: string;
    precoCusto: string;
    precoVenda: string;
    estoqueAtual: string;
    estoqueMinimo: string;
    codigoBarras: string;
}

export interface FornecedorFormData {
    nome: string;
    cnpj: string;
    telefone: string;
    email: string;
    endereco: string;
}

export interface ContaPagarFormData {
    descricao: string;
    valor: string;
    dataVencimento: string;
    fornecedorId: string;
    categoria: string;
}

export interface ContaReceberFormData {
    clienteId: string;
    vendaId: string;
    valor: string;
    dataVencimento: string;
}

// ==================== TIPOS DE CARRINHO (PDV) ====================

export interface CartItem {
    produto: Pick<Produto, 'id' | 'nome' | 'precoVenda' | 'estoqueAtual'>;
    quantidade: number;
    precoUnitario: number;
    desconto: number;
}

// ==================== ENUMS ====================

export type UserRole = 'admin' | 'gerente' | 'vendedor';
export type ContaStatus = 'pendente' | 'pago' | 'vencido' | 'cancelado';
export type FormaPagamento = 'dinheiro' | 'pix' | 'cartao_credito' | 'cartao_debito' | 'boleto';
export type VendaStatus = 'pendente' | 'finalizada' | 'cancelada';
