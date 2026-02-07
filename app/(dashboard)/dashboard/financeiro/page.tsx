'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
    DollarSign,
    Plus,
    Check,
    Trash2,
    Loader2,
    TrendingUp,
    TrendingDown,
    Calendar,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ContaPagar {
    id: number;
    descricao: string;
    valor: string;
    dataVencimento: string;
    dataPagamento: string | null;
    status: string;
    fornecedor?: { nome: string } | null;
    categoria: string | null;
}

interface ContaReceber {
    id: number;
    valor: string;
    dataVencimento: string;
    dataRecebimento: string | null;
    status: string;
    cliente?: { nome: string } | null;
    venda?: { id: number } | null;
}

interface Fornecedor {
    id: number;
    nome: string;
}

export default function FinanceiroPage() {
    const [isOpenPagar, setIsOpenPagar] = useState(false);
    const [formPagar, setFormPagar] = useState({
        descricao: '',
        valor: '',
        dataVencimento: '',
        fornecedorId: '',
        categoria: '',
    });

    const queryClient = useQueryClient();

    const { data: contasPagar, isLoading: loadingPagar } = useQuery({
        queryKey: ['contas-pagar'],
        queryFn: async () => {
            const res = await fetch('/api/financeiro/contas-pagar');
            return res.json();
        },
    });

    const { data: contasReceber, isLoading: loadingReceber } = useQuery({
        queryKey: ['contas-receber'],
        queryFn: async () => {
            const res = await fetch('/api/financeiro/contas-receber');
            return res.json();
        },
    });

    const { data: fornecedores } = useQuery({
        queryKey: ['fornecedores-list'],
        queryFn: async () => {
            const res = await fetch('/api/fornecedores?limit=100');
            return res.json();
        },
    });

    const createContaPagar = useMutation({
        mutationFn: async (data: typeof formPagar) => {
            const res = await fetch('/api/financeiro/contas-pagar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...data,
                    fornecedorId: data.fornecedorId ? parseInt(data.fornecedorId) : null,
                }),
            });
            if (!res.ok) throw new Error('Erro');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['contas-pagar'] });
            toast.success('Conta criada com sucesso!');
            setFormPagar({ descricao: '', valor: '', dataVencimento: '', fornecedorId: '', categoria: '' });
            setIsOpenPagar(false);
        },
        onError: () => toast.error('Erro ao criar conta'),
    });

    const pagarConta = useMutation({
        mutationFn: async (id: number) => {
            const res = await fetch(`/api/financeiro/contas-pagar/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'pago' }),
            });
            if (!res.ok) throw new Error('Erro');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['contas-pagar'] });
            toast.success('Conta marcada como paga!');
        },
        onError: () => toast.error('Erro ao atualizar conta'),
    });

    const receberConta = useMutation({
        mutationFn: async (id: number) => {
            const res = await fetch(`/api/financeiro/contas-receber/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'pago' }),
            });
            if (!res.ok) throw new Error('Erro');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['contas-receber'] });
            toast.success('Conta marcada como recebida!');
        },
        onError: () => toast.error('Erro ao atualizar conta'),
    });

    const deletePagar = useMutation({
        mutationFn: async (id: number) => {
            const res = await fetch(`/api/financeiro/contas-pagar/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Erro');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['contas-pagar'] });
            toast.success('Conta removida!');
        },
        onError: () => toast.error('Erro ao remover conta'),
    });

    const deleteReceber = useMutation({
        mutationFn: async (id: number) => {
            const res = await fetch(`/api/financeiro/contas-receber/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Erro');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['contas-receber'] });
            toast.success('Conta removida!');
        },
        onError: () => toast.error('Erro ao remover conta'),
    });

    const formatCurrency = (value: string) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(parseFloat(value) || 0);
    };

    const formatDate = (date: string) => {
        return format(new Date(date), "dd/MM/yyyy", { locale: ptBR });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pago':
                return <Badge className="bg-green-500">Pago</Badge>;
            case 'atrasado':
                return <Badge variant="destructive">Atrasado</Badge>;
            case 'cancelado':
                return <Badge variant="secondary">Cancelado</Badge>;
            default:
                return <Badge variant="outline">Pendente</Badge>;
        }
    };

    // Calculate totals
    const totalPagar = contasPagar?.data?.reduce(
        (acc: number, c: ContaPagar) => acc + (c.status !== 'pago' ? parseFloat(c.valor) : 0),
        0
    ) || 0;

    const totalReceber = contasReceber?.data?.reduce(
        (acc: number, c: ContaReceber) => acc + (c.status !== 'pago' ? parseFloat(c.valor) : 0),
        0
    ) || 0;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <DollarSign className="h-8 w-8" /> Financeiro
                </h1>
                <p className="text-muted-foreground">
                    Gerencie contas a pagar e a receber
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">A Pagar</CardTitle>
                        <TrendingDown className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-500">
                            {formatCurrency(totalPagar.toString())}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {contasPagar?.data?.filter((c: ContaPagar) => c.status !== 'pago').length || 0} contas pendentes
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">A Receber</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-500">
                            {formatCurrency(totalReceber.toString())}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {contasReceber?.data?.filter((c: ContaReceber) => c.status !== 'pago').length || 0} contas pendentes
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Saldo Previsto</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${totalReceber - totalPagar >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {formatCurrency((totalReceber - totalPagar).toString())}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Receitas - Despesas pendentes
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="pagar" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="pagar">Contas a Pagar</TabsTrigger>
                    <TabsTrigger value="receber">Contas a Receber</TabsTrigger>
                </TabsList>

                {/* Contas a Pagar */}
                <TabsContent value="pagar">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Contas a Pagar</CardTitle>
                            <Dialog open={isOpenPagar} onOpenChange={setIsOpenPagar}>
                                <DialogTrigger asChild>
                                    <Button>
                                        <Plus className="mr-2 h-4 w-4" /> Nova Conta
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <form onSubmit={(e) => { e.preventDefault(); createContaPagar.mutate(formPagar); }}>
                                        <DialogHeader>
                                            <DialogTitle>Nova Conta a Pagar</DialogTitle>
                                            <DialogDescription>
                                                Adicione uma nova despesa
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <div className="space-y-2">
                                                <Label>Descrição *</Label>
                                                <Input
                                                    value={formPagar.descricao}
                                                    onChange={(e) => setFormPagar({ ...formPagar, descricao: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Valor *</Label>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        value={formPagar.valor}
                                                        onChange={(e) => setFormPagar({ ...formPagar, valor: e.target.value })}
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Vencimento *</Label>
                                                    <Input
                                                        type="date"
                                                        value={formPagar.dataVencimento}
                                                        onChange={(e) => setFormPagar({ ...formPagar, dataVencimento: e.target.value })}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Fornecedor</Label>
                                                    <Select
                                                        value={formPagar.fornecedorId}
                                                        onValueChange={(v) => setFormPagar({ ...formPagar, fornecedorId: v })}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Selecione..." />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {fornecedores?.data?.map((f: Fornecedor) => (
                                                                <SelectItem key={f.id} value={f.id.toString()}>
                                                                    {f.nome}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Categoria</Label>
                                                    <Input
                                                        value={formPagar.categoria}
                                                        onChange={(e) => setFormPagar({ ...formPagar, categoria: e.target.value })}
                                                        placeholder="Ex: Aluguel, Luz..."
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button type="submit" disabled={createContaPagar.isPending}>
                                                {createContaPagar.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                Criar
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </CardHeader>
                        <CardContent>
                            {loadingPagar ? (
                                <div className="space-y-2">
                                    {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Descrição</TableHead>
                                            <TableHead>Fornecedor</TableHead>
                                            <TableHead>Vencimento</TableHead>
                                            <TableHead className="text-right">Valor</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Ações</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {contasPagar?.data?.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center text-muted-foreground">
                                                    Nenhuma conta encontrada
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            contasPagar?.data?.map((conta: ContaPagar) => (
                                                <TableRow key={conta.id}>
                                                    <TableCell className="font-medium">{conta.descricao}</TableCell>
                                                    <TableCell>{conta.fornecedor?.nome || '-'}</TableCell>
                                                    <TableCell>{formatDate(conta.dataVencimento)}</TableCell>
                                                    <TableCell className="text-right">{formatCurrency(conta.valor)}</TableCell>
                                                    <TableCell>{getStatusBadge(conta.status)}</TableCell>
                                                    <TableCell className="text-right">
                                                        {conta.status !== 'pago' && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => pagarConta.mutate(conta.id)}
                                                                title="Marcar como pago"
                                                            >
                                                                <Check className="h-4 w-4 text-green-500" />
                                                            </Button>
                                                        )}
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => {
                                                                if (confirm('Deseja remover esta conta?')) {
                                                                    deletePagar.mutate(conta.id);
                                                                }
                                                            }}
                                                        >
                                                            <Trash2 className="h-4 w-4 text-destructive" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Contas a Receber */}
                <TabsContent value="receber">
                    <Card>
                        <CardHeader>
                            <CardTitle>Contas a Receber</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loadingReceber ? (
                                <div className="space-y-2">
                                    {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Cliente</TableHead>
                                            <TableHead>Venda</TableHead>
                                            <TableHead>Vencimento</TableHead>
                                            <TableHead className="text-right">Valor</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Ações</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {contasReceber?.data?.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center text-muted-foreground">
                                                    Nenhuma conta encontrada
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            contasReceber?.data?.map((conta: ContaReceber) => (
                                                <TableRow key={conta.id}>
                                                    <TableCell className="font-medium">{conta.cliente?.nome || '-'}</TableCell>
                                                    <TableCell>{conta.venda ? `#${conta.venda.id}` : '-'}</TableCell>
                                                    <TableCell>{formatDate(conta.dataVencimento)}</TableCell>
                                                    <TableCell className="text-right">{formatCurrency(conta.valor)}</TableCell>
                                                    <TableCell>{getStatusBadge(conta.status)}</TableCell>
                                                    <TableCell className="text-right">
                                                        {conta.status !== 'pago' && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => receberConta.mutate(conta.id)}
                                                                title="Marcar como recebido"
                                                            >
                                                                <Check className="h-4 w-4 text-green-500" />
                                                            </Button>
                                                        )}
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => {
                                                                if (confirm('Deseja remover esta conta?')) {
                                                                    deleteReceber.mutate(conta.id);
                                                                }
                                                            }}
                                                        >
                                                            <Trash2 className="h-4 w-4 text-destructive" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
