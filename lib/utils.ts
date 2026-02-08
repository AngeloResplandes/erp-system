import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ==================== FORMATADORES ====================

/**
 * Formata um valor numérico ou string para moeda brasileira (BRL)
 */
export function formatCurrency(value: number | string): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(numValue || 0);
}

/**
 * Formata uma data para o padrão brasileiro
 */
export function formatDate(date: string | Date, formatStr: string = 'dd/MM/yyyy'): string {
  if (!date) return '-';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, formatStr, { locale: ptBR });
}

/**
 * Formata uma data para exibição com hora
 */
export function formatDateTime(date: string | Date): string {
  return formatDate(date, "dd/MM/yyyy 'às' HH:mm");
}

/**
 * Converte código da forma de pagamento para texto legível
 */
export function formatPaymentMethod(method: string | null): string {
  const methods: Record<string, string> = {
    dinheiro: 'Dinheiro',
    pix: 'PIX',
    cartao_credito: 'Cartão de Crédito',
    cartao_debito: 'Cartão de Débito',
    boleto: 'Boleto',
  };
  return method ? methods[method] || method : '-';
}

/**
 * Converte status de conta para texto legível
 */
export function formatContaStatus(status: string | null): string {
  const statuses: Record<string, string> = {
    pendente: 'Pendente',
    pago: 'Pago',
    vencido: 'Vencido',
    cancelado: 'Cancelado',
  };
  return status ? statuses[status] || status : '-';
}

/**
 * Converte status de venda para texto legível
 */
export function formatVendaStatus(status: string | null): string {
  const statuses: Record<string, string> = {
    pendente: 'Pendente',
    finalizada: 'Finalizada',
    cancelada: 'Cancelada',
  };
  return status ? statuses[status] || status : '-';
}
