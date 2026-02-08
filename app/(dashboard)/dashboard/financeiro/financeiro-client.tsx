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
    TrendingUp,
    TrendingDown,
} from 'lucide-react';
import { toast } from 'sonner';

import { PageHeader } from '@/components/page-header';
import { FormModal } from '@/components/form-modal';
import { ConfirmDialog, useConfirmDialog } from '@/components/confirm-dialog';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Fornecedor, ContaPagarFormData } from '@/types';

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

const initialFormPagar: ContaPagarFormData = {
    descricao: '',
    valor: '',
    dataVencimento: '',
    fornecedorId: '',
    categoria: '',
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

export default function FinanceiroClientPage() {
    const [isOpenPagar, setIsOpenPagar] = useState(false);
    const [formPagar, setFormPagar] = useState<ContaPagarFormData>(initialFormPagar);
    const [deleteTarget, setDeleteTarget] = useState<{ type: 'pagar' | 'receber'; id: number } | null>(null);

    const queryClient = useQueryClient();
    const { isOpen: confirmOpen, setIsOpen: setConfirmOpen, confirm, handleConfirm, isLoading: confirmLoading } = useConfirmDialog();

    // Queries
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

    // Mutations
    const createContaPagar = useMutation({
        mutationFn: async (data: ContaPagarFormData) => {
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
            setFormPagar(initialFormPagar);
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

    const handleDeleteClick = (type: 'pagar' | 'receber', id: number) => {
        setDeleteTarget({ type, id });
        confirm(() => {
            if (type === 'pagar') {
                deletePagar.mutate(id);
            } else {
                deleteReceber.mutate(id);
            }
        });
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

    const fornecedoresData: Fornecedor[] = fornecedores?.data || [];

    return (
        <div className="space-y-6">
            <PageHeader
                title="Financeiro"
                icon={DollarSign}
                description="Gerencie contas a pagar e a receber"
            />

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="gap-2 py-4">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
                        <CardTitle className="text-sm font-medium">A Pagar</CardTitle>
                        <TrendingDown className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent className="pt-0">
                        <div className="text-xl sm:text-2xl font-bold text-red-500">
                            {formatCurrency(totalPagar)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {contasPagar?.data?.filter((c: ContaPagar) => c.status !== 'pago').length || 0} contas pendentes
                        </p>
                    </CardContent>
                </Card>
                <Card className="gap-2 py-4">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
                        <CardTitle className="text-sm font-medium">A Receber</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent className="pt-0">
                        <div className="text-xl sm:text-2xl font-bold text-green-500">
                            {formatCurrency(totalReceber)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {contasReceber?.data?.filter((c: ContaReceber) => c.status !== 'pago').length || 0} contas pendentes
                        </p>
                    </CardContent>
                </Card>
                <Card className="gap-2 py-4">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
                        <CardTitle className="text-sm font-medium">Saldo Previsto</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="pt-0">
                        <div className={`text-xl sm:text-2xl font-bold ${totalReceber - totalPagar >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {formatCurrency(totalReceber - totalPagar)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Receitas - Despesas pendentes
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="pagar" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="pagar" className="text-xs sm:text-sm">Contas a Pagar</TabsTrigger>
                    <TabsTrigger value="receber" className="text-xs sm:text-sm">Contas a Receber</TabsTrigger>
                </TabsList>

                {/* Contas a Pagar */}
                <TabsContent value="pagar">
                    <Card>
                        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <CardTitle>Contas a Pagar</CardTitle>
                            <FormModal
                                isOpen={isOpenPagar}
                                onOpenChange={setIsOpenPagar}
                                title="Nova Conta a Pagar"
                                description="Adicione uma nova despesa"
                                isSubmitting={createContaPagar.isPending}
                                onSubmit={(e) => { e.preventDefault(); createContaPagar.mutate(formPagar); }}
                                trigger={
                                    <Button className="w-full sm:w-auto">
                                        <Plus className="mr-2 h-4 w-4" /> <span className="hidden sm:inline">Nova </span>Conta
                                    </Button>
                                }
                            >
                                <div className="space-y-2">
                                    <Label>Descrição *</Label>
                                    <Input
                                        value={formPagar.descricao}
                                        onChange={(e) => setFormPagar({ ...formPagar, descricao: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                                                {fornecedoresData.map((f) => (
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
                            </FormModal>
                        </CardHeader>
                        <CardContent className="px-2 sm:px-6">
                            <div className="overflow-x-auto -mx-2 sm:mx-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="min-w-[120px]">Descrição</TableHead>
                                            <TableHead className="hidden sm:table-cell min-w-[100px]">Fornecedor</TableHead>
                                            <TableHead className="hidden sm:table-cell min-w-[90px]">Vencimento</TableHead>
                                            <TableHead className="hidden sm:table-cell text-right min-w-[80px]">Valor</TableHead>
                                            <TableHead className="hidden sm:table-cell min-w-[70px]">Status</TableHead>
                                            <TableHead className="text-right w-[70px]">Ações</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loadingPagar ? (
                                            Array.from({ length: 5 }).map((_, i) => (
                                                <TableRow key={i}>
                                                    <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                                                    <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-[150px]" /></TableCell>
                                                    <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-[100px]" /></TableCell>
                                                    <TableCell className="hidden sm:table-cell text-right"><Skeleton className="h-4 w-[80px] ml-auto" /></TableCell>
                                                    <TableCell className="hidden sm:table-cell"><Skeleton className="h-6 w-[80px] rounded-full" /></TableCell>
                                                    <TableCell className="text-right"><Skeleton className="h-8 w-8 rounded-full ml-auto" /></TableCell>
                                                </TableRow>
                                            ))
                                        ) : contasPagar?.data?.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center text-muted-foreground">
                                                    Nenhuma conta encontrada
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            contasPagar?.data?.map((conta: ContaPagar) => (
                                                <TableRow key={conta.id}>
                                                    <TableCell className="font-medium max-w-[80px] truncate" title={conta.descricao}>
                                                        {conta.descricao}
                                                    </TableCell>
                                                    <TableCell className="hidden sm:table-cell max-w-[80px] truncate" title={conta.fornecedor?.nome || undefined}>{conta.fornecedor?.nome || '-'}</TableCell>
                                                    <TableCell className="hidden sm:table-cell">{formatDate(conta.dataVencimento)}</TableCell>
                                                    <TableCell className="hidden sm:table-cell text-right">{formatCurrency(conta.valor)}</TableCell>
                                                    <TableCell className="hidden sm:table-cell">{getStatusBadge(conta.status)}</TableCell>
                                                    <TableCell className="text-right p-1">
                                                        <div className="flex justify-end gap-0">
                                                            {conta.status !== 'pago' && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8"
                                                                    onClick={() => pagarConta.mutate(conta.id)}
                                                                    title="Marcar como pago"
                                                                >
                                                                    <Check className="h-3.5 w-3.5 text-green-500" />
                                                                </Button>
                                                            )}
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8"
                                                                onClick={() => handleDeleteClick('pagar', conta.id)}
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5 text-destructive" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Contas a Receber */}
                <TabsContent value="receber">
                    <Card>
                        <CardHeader>
                            <CardTitle>Contas a Receber</CardTitle>
                        </CardHeader>
                        <CardContent className="px-2 sm:px-6">
                            <div className="overflow-x-auto -mx-2 sm:mx-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="min-w-[120px]">Cliente</TableHead>
                                            <TableHead className="hidden sm:table-cell min-w-[60px]">Venda</TableHead>
                                            <TableHead className="hidden sm:table-cell min-w-[90px]">Vencimento</TableHead>
                                            <TableHead className="hidden sm:table-cell text-right min-w-[80px]">Valor</TableHead>
                                            <TableHead className="hidden sm:table-cell min-w-[70px]">Status</TableHead>
                                            <TableHead className="text-right w-[70px]">Ações</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loadingReceber ? (
                                            Array.from({ length: 5 }).map((_, i) => (
                                                <TableRow key={i}>
                                                    <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                                                    <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-[60px]" /></TableCell>
                                                    <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-[100px]" /></TableCell>
                                                    <TableCell className="hidden sm:table-cell text-right"><Skeleton className="h-4 w-[80px] ml-auto" /></TableCell>
                                                    <TableCell className="hidden sm:table-cell"><Skeleton className="h-6 w-[80px] rounded-full" /></TableCell>
                                                    <TableCell className="text-right"><Skeleton className="h-8 w-8 rounded-full ml-auto" /></TableCell>
                                                </TableRow>
                                            ))
                                        ) : contasReceber?.data?.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center text-muted-foreground">
                                                    Nenhuma conta encontrada
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            contasReceber?.data?.map((conta: ContaReceber) => (
                                                <TableRow key={conta.id}>
                                                    <TableCell className="font-medium max-w-[80px] truncate" title={conta.cliente?.nome}>
                                                        {conta.cliente?.nome || '-'}
                                                    </TableCell>
                                                    <TableCell className="hidden sm:table-cell">{conta.venda ? `#${conta.venda.id}` : '-'}</TableCell>
                                                    <TableCell className="hidden sm:table-cell">{formatDate(conta.dataVencimento)}</TableCell>
                                                    <TableCell className="hidden sm:table-cell text-right">{formatCurrency(conta.valor)}</TableCell>
                                                    <TableCell className="hidden sm:table-cell">{getStatusBadge(conta.status)}</TableCell>
                                                    <TableCell className="text-right p-1">
                                                        <div className="flex justify-end gap-0">
                                                            {conta.status !== 'pago' && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8"
                                                                    onClick={() => receberConta.mutate(conta.id)}
                                                                    title="Marcar como recebido"
                                                                >
                                                                    <Check className="h-3.5 w-3.5 text-green-500" />
                                                                </Button>
                                                            )}
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8"
                                                                onClick={() => handleDeleteClick('receber', conta.id)}
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5 text-destructive" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <ConfirmDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                title="Remover conta"
                message="Tem certeza que deseja remover esta conta? Esta ação não pode ser desfeita."
                confirmText="Remover"
                onConfirm={handleConfirm}
                isLoading={confirmLoading}
            />
        </div>
    );
}
