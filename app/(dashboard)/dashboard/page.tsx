'use client';

import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Users,
    Package,
    ShoppingCart,
    DollarSign,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
} from 'lucide-react';

// Mock data - será substituído por dados reais do backend
const stats = [
    {
        title: 'Clientes',
        value: '1.234',
        description: '+12% em relação ao mês anterior',
        icon: Users,
        trend: 'up',
    },
    {
        title: 'Produtos',
        value: '567',
        description: '23 com estoque baixo',
        icon: Package,
        trend: 'warning',
    },
    {
        title: 'Vendas do Mês',
        value: 'R$ 45.231,89',
        description: '+8% em relação ao mês anterior',
        icon: ShoppingCart,
        trend: 'up',
    },
    {
        title: 'Saldo',
        value: 'R$ 12.345,67',
        description: 'Contas a pagar: R$ 5.000',
        icon: DollarSign,
        trend: 'neutral',
    },
];

export default function DashboardPage() {
    const { user, isLoading } = useAuth();

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

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Card key={stat.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                            <stat.icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                {stat.trend === 'up' && <TrendingUp className="h-3 w-3 text-green-500" />}
                                {stat.trend === 'down' && <TrendingDown className="h-3 w-3 text-red-500" />}
                                {stat.trend === 'warning' && <AlertTriangle className="h-3 w-3 text-yellow-500" />}
                                {stat.description}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Vendas Recentes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Nenhuma venda registrada ainda. Comece adicionando produtos e clientes.
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Alertas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                <span>Configure o banco de dados para funcionalidade completa</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
