'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import {
    Users,
    Package,
    DollarSign,
    AlertTriangle,
    CheckCircle,
    Building2,
    Calendar,
    CreditCard,
    Target,
    BarChart3,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Instância criada uma única vez no nível do módulo (evita recriar a cada render)
const currencyFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
});

function formatCurrency(value: number): string {
    return currencyFormatter.format(value);
}

// Mapa de formas de pagamento hoistado fora do componente
const paymentMethodMap: Record<string, string> = {
    dinheiro: 'Dinheiro',
    pix: 'PIX',
    cartao_credito: 'Cartão de Crédito',
    cartao_debito: 'Cartão de Débito',
    boleto: 'Boleto',
};

function formatPaymentMethod(method: string | null): string {
    return paymentMethodMap[method || ''] || method || '-';
}

interface DashboardStats {
    clientes: { total: number };
    produtos: { total: number; estoqueBaixo: number };
    fornecedores: { total: number };
    vendasMes: { total: number; quantidade: number; variacao: number; mesAnterior: number };
    vendasGeral: { total: number; quantidade: number; ticketMedio: number };
    financeiro: {
        saldo: number;
        contasPagar: number;
        contasReceber: number;
        contasAVencer7Dias: number;
        valorContasAVencer7Dias: number;
        receberAVencer7Dias: number;
        valorReceberAVencer7Dias: number;
    };
}

interface VendaRecente {
    id: number;
    clienteNome: string;
    total: string;
    dataVenda: string;
    formaPagamento: string;
}

interface ProdutoMaisVendido {
    produtoId: number;
    nome: string;
    totalVendido: number;
    valorTotal: string;
}

interface VendaPorPagamento {
    formaPagamento: string;
    count: number;
    total: string;
}

interface DashboardData {
    stats: DashboardStats;
    vendasRecentes: VendaRecente[];
    produtosMaisVendidos: ProdutoMaisVendido[];
    vendasPorPagamento: VendaPorPagamento[];
}

export default function DashboardClientPage() {
    const { user, isLoading: authLoading } = useAuth();

    const { data, isLoading: loadingStats } = useQuery<DashboardData>({
        queryKey: ['dashboard'],
        queryFn: async () => {
            const res = await fetch('/api/dashboard');
            if (!res.ok) throw new Error('Erro ao buscar dados do dashboard');
            return res.json();
        },
        staleTime: 60_000, // 1 minuto de cache
    });

    const stats = data?.stats ?? null;
    const vendasRecentes = data?.vendasRecentes ?? [];
    const produtosMaisVendidos = data?.produtosMaisVendidos ?? [];
    const vendasPorPagamento = data?.vendasPorPagamento ?? [];

    // Calculado durante o render, sem spread que pode causar stack overflow
    const maxVendido = produtosMaisVendidos.reduce(
        (max, p) => Math.max(max, p.totalVendido),
        1
    );

    if (authLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-64" />
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-32" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                    Olá, {user?.nome?.split(' ')[0]}! 👋
                </h1>
                <p className="text-muted-foreground">
                    Aqui está o resumo do seu negócio hoje.
                </p>
            </div>

            {/* Cards principais */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Card Clientes */}
                <Card className="gap-2 py-4">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
                        <CardTitle className="text-sm font-medium">Clientes</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="pt-0">
                        {loadingStats ? (
                            <Skeleton className="h-8 w-20" />
                        ) : (
                            <>
                                <div className="text-2xl font-bold">{stats?.clientes.total || 0}</div>
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Users className="h-3 w-3 text-blue-500" />
                                    Clientes ativos
                                </p>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Card Produtos */}
                <Card className="gap-2 py-4">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
                        <CardTitle className="text-sm font-medium">Produtos</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="pt-0">
                        {loadingStats ? (
                            <Skeleton className="h-8 w-20" />
                        ) : (
                            <>
                                <div className="text-2xl font-bold">{stats?.produtos.total || 0}</div>
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    {(stats?.produtos.estoqueBaixo || 0) > 0 ? (
                                        <>
                                            <AlertTriangle className="h-3 w-3 text-yellow-500" />
                                            {stats?.produtos.estoqueBaixo} com estoque baixo
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="h-3 w-3 text-green-500" />
                                            Estoque em dia
                                        </>
                                    )}
                                </p>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Card Fornecedores */}
                <Card className="gap-2 py-4">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
                        <CardTitle className="text-sm font-medium">Fornecedores</CardTitle>
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="pt-0">
                        {loadingStats ? (
                            <Skeleton className="h-8 w-20" />
                        ) : (
                            <>
                                <div className="text-2xl font-bold">{stats?.fornecedores.total || 0}</div>
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Building2 className="h-3 w-3 text-purple-500" />
                                    Parceiros ativos
                                </p>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Card Ticket Médio */}
                <Card className="gap-2 py-4">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
                        <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="pt-0">
                        {loadingStats ? (
                            <Skeleton className="h-8 w-32" />
                        ) : (
                            <>
                                <div className="text-2xl font-bold">
                                    {formatCurrency(stats?.vendasGeral.ticketMedio || 0)}
                                </div>
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <BarChart3 className="h-3 w-3 text-indigo-500" />
                                    Média por venda
                                </p>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Segunda linha de cards detalhados */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Vendas Recentes */}
                <Card className="lg:col-span-1 gap-2 py-4">
                    <CardHeader className="pb-0">
                        <CardTitle className="text-base">Vendas Recentes</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                        {loadingStats ? (
                            <div className="space-y-2">
                                {[1, 2, 3].map((i) => (
                                    <Skeleton key={i} className="h-12 w-full" />
                                ))}
                            </div>
                        ) : vendasRecentes.length > 0 ? (
                            <div className="space-y-3">
                                {vendasRecentes.map((venda) => (
                                    <div key={venda.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium truncate">{venda.clienteNome}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {format(new Date(venda.dataVenda), "dd/MM 'às' HH:mm", { locale: ptBR })} • {formatPaymentMethod(venda.formaPagamento)}
                                            </p>
                                        </div>
                                        <div className="text-sm font-semibold text-green-500 ml-2">
                                            {formatCurrency(parseFloat(venda.total))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                Nenhuma venda registrada ainda.
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Produtos Mais Vendidos */}
                <Card className="lg:col-span-1 gap-2 py-4">
                    <CardHeader className="pb-0">
                        <CardTitle className="text-base">Produtos Mais Vendidos</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                        {loadingStats ? (
                            <div className="space-y-2">
                                {[1, 2, 3].map((i) => (
                                    <Skeleton key={i} className="h-12 w-full" />
                                ))}
                            </div>
                        ) : produtosMaisVendidos.length > 0 ? (
                            <div className="space-y-3">
                                {produtosMaisVendidos.map((produto, index) => (
                                    <div key={produto.produtoId} className="space-y-1">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 min-w-0 flex-1">
                                                <span className="text-xs font-bold text-muted-foreground w-5">
                                                    #{index + 1}
                                                </span>
                                                <span className="text-sm truncate">{produto.nome}</span>
                                            </div>
                                            <span className="text-sm font-medium ml-2">{produto.totalVendido} un</span>
                                        </div>
                                        <Progress
                                            value={(produto.totalVendido / maxVendido) * 100}
                                            className="h-1.5"
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                Nenhum produto vendido ainda.
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Alertas e Status */}
                <Card className="lg:col-span-1 gap-2 py-4">
                    <CardHeader className="pb-0">
                        <CardTitle className="text-base">Alertas do Sistema</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <div className="space-y-3">
                            {/* Status da conexão — derivado do próprio estado da query */}
                            {loadingStats ? (
                                <div className="flex items-center gap-2 text-sm">
                                    <Skeleton className="h-4 w-4 rounded-full" />
                                    <span className="text-muted-foreground">Verificando conexão...</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-sm p-2 rounded-lg bg-green-500/10">
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    <span>Sistema funcionando normalmente</span>
                                </div>
                            )}

                            {/* Alerta de estoque baixo */}
                            {!loadingStats && (stats?.produtos.estoqueBaixo || 0) > 0 && (
                                <div className="flex items-center gap-2 text-sm p-2 rounded-lg bg-yellow-500/10">
                                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                    <span className="text-yellow-500">
                                        {stats?.produtos.estoqueBaixo} produto(s) com estoque baixo
                                    </span>
                                </div>
                            )}

                            {/* Contas a vencer */}
                            {!loadingStats && (stats?.financeiro.contasAVencer7Dias || 0) > 0 && (
                                <div className="flex items-center gap-2 text-sm p-2 rounded-lg bg-orange-500/10">
                                    <Calendar className="h-4 w-4 text-orange-500" />
                                    <span className="text-orange-500">
                                        {stats?.financeiro.contasAVencer7Dias} conta(s) vencem em 7 dias
                                    </span>
                                </div>
                            )}

                            {/* Contas a receber */}
                            {!loadingStats && (stats?.financeiro.receberAVencer7Dias || 0) > 0 && (
                                <div className="flex items-center gap-2 text-sm p-2 rounded-lg bg-blue-500/10">
                                    <DollarSign className="h-4 w-4 text-blue-500" />
                                    <span className="text-blue-500">
                                        {formatCurrency(stats?.financeiro.valorReceberAVencer7Dias || 0)} a receber em 7 dias
                                    </span>
                                </div>
                            )}

                            {/* Formas de pagamento mais usadas */}
                            {!loadingStats && vendasPorPagamento.length > 0 && (
                                <div className="pt-2 border-t">
                                    <p className="text-xs font-medium text-muted-foreground mb-2">Formas de pagamento</p>
                                    <div className="flex flex-wrap gap-1">
                                        {vendasPorPagamento.slice(0, 3).map((vp) => (
                                            <span
                                                key={vp.formaPagamento}
                                                className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-muted text-xs"
                                            >
                                                <CreditCard className="h-3 w-3" />
                                                {formatPaymentMethod(vp.formaPagamento)} ({vp.count})
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
