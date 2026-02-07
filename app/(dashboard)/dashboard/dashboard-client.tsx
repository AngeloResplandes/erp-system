'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import {
    Users,
    Package,
    ShoppingCart,
    DollarSign,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    CheckCircle,
    Building2,
    Calendar,
    Receipt,
    CreditCard,
    Target,
    BarChart3,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type DbStatus = 'loading' | 'connected' | 'error';

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

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value);
}

function formatPaymentMethod(method: string | null): string {
    const methods: Record<string, string> = {
        dinheiro: 'Dinheiro',
        pix: 'PIX',
        cartao_credito: 'Cartão de Crédito',
        cartao_debito: 'Cartão de Débito',
        boleto: 'Boleto',
    };
    return methods[method || ''] || method || '-';
}

export default function DashboardClientPage() {
    const { user, isLoading } = useAuth();
    const [dbStatus, setDbStatus] = useState<DbStatus>('loading');
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [vendasRecentes, setVendasRecentes] = useState<VendaRecente[]>([]);
    const [produtosMaisVendidos, setProdutosMaisVendidos] = useState<ProdutoMaisVendido[]>([]);
    const [vendasPorPagamento, setVendasPorPagamento] = useState<VendaPorPagamento[]>([]);
    const [loadingStats, setLoadingStats] = useState(true);

    useEffect(() => {
        const checkDatabase = async () => {
            try {
                const response = await fetch('/api/health');
                const data = await response.json();
                setDbStatus(data.status === 'connected' ? 'connected' : 'error');
            } catch {
                setDbStatus('error');
            }
        };
        checkDatabase();
    }, []);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await fetch('/api/dashboard');
                if (response.ok) {
                    const data = await response.json();
                    setStats(data.stats);
                    setVendasRecentes(data.vendasRecentes || []);
                    setProdutosMaisVendidos(data.produtosMaisVendidos || []);
                    setVendasPorPagamento(data.vendasPorPagamento || []);
                }
            } catch (error) {
                console.error('Erro ao buscar dados do dashboard:', error);
            } finally {
                setLoadingStats(false);
            }
        };
        fetchDashboardData();
    }, []);

    if (isLoading) {
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

    const maxVendido = produtosMaisVendidos.length > 0
        ? Math.max(...produtosMaisVendidos.map(p => p.totalVendido))
        : 1;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">
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

            {/* Cards de vendas e financeiro */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Card Vendas do Mês */}
                <Card className="gap-2 py-4">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
                        <CardTitle className="text-sm font-medium">Vendas do Mês</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="pt-0">
                        {loadingStats ? (
                            <Skeleton className="h-8 w-32" />
                        ) : (
                            <>
                                <div className="text-2xl font-bold text-green-500">
                                    {formatCurrency(stats?.vendasMes.total || 0)}
                                </div>
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    {(stats?.vendasMes.variacao || 0) >= 0 ? (
                                        <TrendingUp className="h-3 w-3 text-green-500" />
                                    ) : (
                                        <TrendingDown className="h-3 w-3 text-red-500" />
                                    )}
                                    {stats?.vendasMes.quantidade || 0} vendas
                                    {(stats?.vendasMes.mesAnterior || 0) > 0 && (
                                        <span className={stats?.vendasMes.variacao && stats.vendasMes.variacao >= 0 ? 'text-green-500' : 'text-red-500'}>
                                            ({stats?.vendasMes.variacao?.toFixed(1)}%)
                                        </span>
                                    )}
                                </p>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Card Total Vendas */}
                <Card className="gap-2 py-4">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
                        <CardTitle className="text-sm font-medium">Total Vendas</CardTitle>
                        <Receipt className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="pt-0">
                        {loadingStats ? (
                            <Skeleton className="h-8 w-32" />
                        ) : (
                            <>
                                <div className="text-2xl font-bold">
                                    {formatCurrency(stats?.vendasGeral.total || 0)}
                                </div>
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <ShoppingCart className="h-3 w-3 text-blue-500" />
                                    {stats?.vendasGeral.quantidade || 0} vendas realizadas
                                </p>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Card Saldo */}
                <Card className="gap-2 py-4">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
                        <CardTitle className="text-sm font-medium">Saldo</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="pt-0">
                        {loadingStats ? (
                            <Skeleton className="h-8 w-32" />
                        ) : (
                            <>
                                <div className={`text-2xl font-bold ${(stats?.financeiro.saldo || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    {formatCurrency(stats?.financeiro.saldo || 0)}
                                </div>
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    {(stats?.financeiro.saldo || 0) >= 0 ? (
                                        <TrendingUp className="h-3 w-3 text-green-500" />
                                    ) : (
                                        <TrendingDown className="h-3 w-3 text-red-500" />
                                    )}
                                    A pagar: {formatCurrency(stats?.financeiro.contasPagar || 0)}
                                </p>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Card Contas a Vencer */}
                <Card className="gap-2 py-4">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
                        <CardTitle className="text-sm font-medium">Próximos 7 dias</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="pt-0">
                        {loadingStats ? (
                            <Skeleton className="h-8 w-32" />
                        ) : (
                            <>
                                <div className="text-2xl font-bold text-orange-500">
                                    {formatCurrency(stats?.financeiro.valorContasAVencer7Dias || 0)}
                                </div>
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <AlertTriangle className="h-3 w-3 text-orange-500" />
                                    {stats?.financeiro.contasAVencer7Dias || 0} contas a pagar
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
                            {/* Status do banco */}
                            {dbStatus === 'loading' && (
                                <div className="flex items-center gap-2 text-sm">
                                    <Skeleton className="h-4 w-4 rounded-full" />
                                    <span className="text-muted-foreground">Verificando conexão...</span>
                                </div>
                            )}
                            {dbStatus === 'connected' && (
                                <div className="flex items-center gap-2 text-sm p-2 rounded-lg bg-green-500/10">
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    <span>Sistema funcionando normalmente</span>
                                </div>
                            )}
                            {dbStatus === 'error' && (
                                <div className="flex items-center gap-2 text-sm p-2 rounded-lg bg-red-500/10">
                                    <AlertTriangle className="h-4 w-4 text-red-500" />
                                    <span className="text-red-500">Erro de conexão com o banco</span>
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
