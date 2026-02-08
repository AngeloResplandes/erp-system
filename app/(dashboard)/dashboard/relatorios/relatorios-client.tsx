'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart3, TrendingUp, Package, Users, ShoppingCart, Building2, DollarSign } from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
} from 'recharts';
import { useState } from 'react';

interface VendaMensal {
    mes: string;
    vendas: number;
    receita: number;
}

interface ProdutoMaisVendido {
    nome: string;
    quantidade: number;
}

interface FormaPagamento {
    name: string;
    value: number;
    total: number;
    color: string;
}

interface Resumo {
    totalClientes: number;
    totalProdutos: number;
    totalFornecedores: number;
    totalVendas: number;
    receitaTotal: number;
    vendasPeriodo: number;
    receitaPeriodo: number;
}

interface RelatoriosData {
    vendasMensais: VendaMensal[];
    produtosMaisVendidos: ProdutoMaisVendido[];
    formasPagamento: FormaPagamento[];
    resumo: Resumo;
}

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value);
}

export default function RelatoriosClientPage() {
    const [periodo, setPeriodo] = useState('6m');

    const { data, isLoading } = useQuery<RelatoriosData>({
        queryKey: ['relatorios', periodo],
        queryFn: async () => {
            const res = await fetch(`/api/relatorios?periodo=${periodo}`);
            return res.json();
        },
    });

    const vendasMensais = data?.vendasMensais || [];
    const produtosMaisVendidos = data?.produtosMaisVendidos || [];
    const formasPagamentoData = data?.formasPagamento || [];
    const resumo = data?.resumo;

    return (
        <div className="space-y-6 overflow-x-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
                        <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8" />
                        Relatórios
                    </h1>
                    <p className="text-sm sm:text-base text-muted-foreground">
                        Análise de desempenho e métricas
                    </p>
                </div>
                <Select value={periodo} onValueChange={setPeriodo}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Período" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="3m">Últimos 3 meses</SelectItem>
                        <SelectItem value="6m">Últimos 6 meses</SelectItem>
                        <SelectItem value="12m">Últimos 12 meses</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                <Card className="gap-2 py-4">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
                        <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="pt-0">
                        {isLoading ? (
                            <Skeleton className="h-8 w-20" />
                        ) : (
                            <div className="text-xl sm:text-2xl font-bold">{resumo?.totalClientes || 0}</div>
                        )}
                    </CardContent>
                </Card>
                <Card className="gap-2 py-4">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
                        <CardTitle className="text-sm font-medium">Total Produtos</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="pt-0">
                        {isLoading ? (
                            <Skeleton className="h-8 w-20" />
                        ) : (
                            <div className="text-xl sm:text-2xl font-bold">{resumo?.totalProdutos || 0}</div>
                        )}
                    </CardContent>
                </Card>
                <Card className="gap-2 py-4">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
                        <CardTitle className="text-sm font-medium">Vendas no Período</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="pt-0">
                        {isLoading ? (
                            <Skeleton className="h-8 w-20" />
                        ) : (
                            <>
                                <div className="text-xl sm:text-2xl font-bold">{resumo?.vendasPeriodo || 0}</div>
                                <p className="text-xs text-muted-foreground">
                                    de {resumo?.totalVendas || 0} totais
                                </p>
                            </>
                        )}
                    </CardContent>
                </Card>
                <Card className="gap-2 py-4">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
                        <CardTitle className="text-sm font-medium">Receita no Período</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent className="pt-0">
                        {isLoading ? (
                            <Skeleton className="h-8 w-32" />
                        ) : (
                            <>
                                <div className="text-lg sm:text-2xl font-bold text-green-500">
                                    {formatCurrency(resumo?.receitaPeriodo || 0)}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Total: {formatCurrency(resumo?.receitaTotal || 0)}
                                </p>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row 1 */}
            <div className="grid gap-4 md:grid-cols-2">
                {/* Vendas Mensais */}
                <Card className="gap-2 py-4">
                    <CardHeader className="pb-0">
                        <CardTitle className="text-base">Vendas Mensais</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-2 px-2 sm:px-6">
                        {isLoading ? (
                            <Skeleton className="h-64 w-full" />
                        ) : vendasMensais.length > 0 ? (
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={vendasMensais}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                    <XAxis dataKey="mes" stroke="#888" fontSize={10} tick={{ fontSize: 10 }} />
                                    <YAxis stroke="#888" fontSize={10} tick={{ fontSize: 10 }} width={30} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1f1f1f', border: '1px solid #333', color: '#fff' }}
                                        itemStyle={{ color: '#fff' }}
                                        labelStyle={{ color: '#fff' }}
                                        formatter={(value) => [value, 'Vendas']}
                                    />
                                    <Bar dataKey="vendas" fill="#22c55e" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-64 flex items-center justify-center text-muted-foreground">
                                Nenhuma venda no período selecionado
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Receita Mensal */}
                <Card className="gap-2 py-4">
                    <CardHeader className="pb-0">
                        <CardTitle className="text-base">Receita Mensal</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-2 px-2 sm:px-6">
                        {isLoading ? (
                            <Skeleton className="h-64 w-full" />
                        ) : vendasMensais.length > 0 ? (
                            <ResponsiveContainer width="100%" height={200}>
                                <LineChart data={vendasMensais}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                    <XAxis dataKey="mes" stroke="#888" fontSize={10} tick={{ fontSize: 10 }} />
                                    <YAxis
                                        stroke="#888"
                                        fontSize={10}
                                        tick={{ fontSize: 10 }}
                                        width={40}
                                        tickFormatter={(value) => `R$${(value / 1000).toFixed(0)}k`}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1f1f1f', border: '1px solid #333', color: '#fff' }}
                                        itemStyle={{ color: '#fff' }}
                                        labelStyle={{ color: '#fff' }}
                                        formatter={(value) => [formatCurrency(Number(value)), 'Receita']}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="receita"
                                        stroke="#3b82f6"
                                        strokeWidth={2}
                                        dot={{ fill: '#3b82f6', strokeWidth: 2 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-64 flex items-center justify-center text-muted-foreground">
                                Nenhuma receita no período selecionado
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row 2 */}
            <div className="grid gap-4 md:grid-cols-2">
                {/* Formas de Pagamento */}
                <Card className="gap-2 py-4">
                    <CardHeader className="pb-0">
                        <CardTitle className="text-base">Formas de Pagamento</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-2 px-2 sm:px-6">
                        {isLoading ? (
                            <Skeleton className="h-64 w-full" />
                        ) : formasPagamentoData.length > 0 ? (
                            <div className="flex flex-col sm:flex-row items-center gap-4">
                                <ResponsiveContainer width="100%" height={160} className="sm:w-1/2">
                                    <PieChart>
                                        <Pie
                                            data={formasPagamentoData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={40}
                                            outerRadius={65}
                                            paddingAngle={2}
                                            dataKey="value"
                                        >
                                            {formasPagamentoData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1f1f1f', border: '1px solid #333', color: '#fff' }}
                                            itemStyle={{ color: '#fff' }}
                                            labelStyle={{ color: '#fff' }}
                                            formatter={(value, _name, props) => [
                                                `${value} vendas (${formatCurrency((props.payload as FormaPagamento).total)})`,
                                                (props.payload as FormaPagamento).name
                                            ]}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="w-full sm:flex-1 space-y-2">
                                    {formasPagamentoData.map((item) => (
                                        <div key={item.name} className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ backgroundColor: item.color }}
                                                />
                                                <span>{item.name}</span>
                                            </div>
                                            <span className="font-medium">{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="h-64 flex items-center justify-center text-muted-foreground">
                                Nenhum dado de pagamento disponível
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Produtos Mais Vendidos */}
                <Card className="gap-2 py-4">
                    <CardHeader className="pb-0">
                        <CardTitle className="text-base">Produtos Mais Vendidos</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-2 px-2 sm:px-6">
                        {isLoading ? (
                            <Skeleton className="h-64 w-full" />
                        ) : produtosMaisVendidos.length > 0 ? (
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={produtosMaisVendidos} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                    <XAxis type="number" stroke="#888" fontSize={10} tick={{ fontSize: 10 }} />
                                    <YAxis
                                        type="category"
                                        dataKey="nome"
                                        stroke="#888"
                                        fontSize={9}
                                        tick={{ fontSize: 9 }}
                                        width={80}
                                        tickFormatter={(value) => value.length > 10 ? `${value.slice(0, 10)}...` : value}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1f1f1f', border: '1px solid #333', color: '#fff' }}
                                        itemStyle={{ color: '#fff' }}
                                        labelStyle={{ color: '#fff' }}
                                        formatter={(value) => [`${value} unidades`, 'Quantidade']}
                                    />
                                    <Bar dataKey="quantidade" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-64 flex items-center justify-center text-muted-foreground">
                                Nenhum produto vendido no período
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
