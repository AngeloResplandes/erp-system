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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Pencil, Trash2, Loader2, Package, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface Produto {
    id: number;
    nome: string;
    descricao: string | null;
    precoCusto: string;
    precoVenda: string;
    estoqueAtual: number;
    estoqueMinimo: number;
    codigoBarras: string | null;
    ativo: boolean;
    categoria?: { id: number; nome: string } | null;
}

interface Categoria {
    id: number;
    nome: string;
}

export default function ProdutosClientPage() {
    const [search, setSearch] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Produto | null>(null);
    const [formData, setFormData] = useState({
        nome: '',
        descricao: '',
        categoriaId: '',
        precoCusto: '',
        precoVenda: '',
        estoqueAtual: '',
        estoqueMinimo: '5',
        codigoBarras: '',
    });

    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['produtos', search],
        queryFn: async () => {
            const res = await fetch(`/api/produtos?search=${search}`);
            return res.json();
        },
    });

    const { data: categorias } = useQuery({
        queryKey: ['categorias'],
        queryFn: async () => {
            const res = await fetch('/api/categorias');
            return res.json();
        },
    });

    const createMutation = useMutation({
        mutationFn: async (data: typeof formData) => {
            const res = await fetch('/api/produtos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...data,
                    categoriaId: data.categoriaId ? parseInt(data.categoriaId) : null,
                }),
            });
            if (!res.ok) throw new Error('Erro ao criar produto');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['produtos'] });
            toast.success('Produto criado com sucesso!');
            resetForm();
            setIsOpen(false);
        },
        onError: () => {
            toast.error('Erro ao criar produto');
        },
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: number; data: typeof formData }) => {
            const res = await fetch(`/api/produtos/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...data,
                    categoriaId: data.categoriaId ? parseInt(data.categoriaId) : null,
                }),
            });
            if (!res.ok) throw new Error('Erro ao atualizar produto');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['produtos'] });
            toast.success('Produto atualizado com sucesso!');
            resetForm();
            setIsOpen(false);
        },
        onError: () => {
            toast.error('Erro ao atualizar produto');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            const res = await fetch(`/api/produtos/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Erro ao deletar produto');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['produtos'] });
            toast.success('Produto removido com sucesso!');
        },
        onError: () => {
            toast.error('Erro ao remover produto');
        },
    });

    const resetForm = () => {
        setFormData({
            nome: '',
            descricao: '',
            categoriaId: '',
            precoCusto: '',
            precoVenda: '',
            estoqueAtual: '',
            estoqueMinimo: '5',
            codigoBarras: '',
        });
        setEditingProduct(null);
    };

    const handleEdit = (produto: Produto) => {
        setEditingProduct(produto);
        setFormData({
            nome: produto.nome,
            descricao: produto.descricao || '',
            categoriaId: produto.categoria?.id?.toString() || '',
            precoCusto: produto.precoCusto,
            precoVenda: produto.precoVenda,
            estoqueAtual: produto.estoqueAtual.toString(),
            estoqueMinimo: produto.estoqueMinimo.toString(),
            codigoBarras: produto.codigoBarras || '',
        });
        setIsOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingProduct) {
            updateMutation.mutate({ id: editingProduct.id, data: formData });
        } else {
            createMutation.mutate(formData);
        }
    };

    const formatCurrency = (value: string) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(parseFloat(value) || 0);
    };

    const isSubmitting = createMutation.isPending || updateMutation.isPending;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
                        <Package className="h-8 w-8" /> Produtos
                    </h1>
                    <p className="text-muted-foreground">
                        Gerencie seus produtos e estoque
                    </p>
                </div>
                <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
                    <DialogTrigger asChild>
                        <Button className="w-full sm:w-auto">
                            <Plus className="mr-2 h-4 w-4" /> Novo Produto
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                        <form onSubmit={handleSubmit}>
                            <DialogHeader>
                                <DialogTitle>
                                    {editingProduct ? 'Editar Produto' : 'Novo Produto'}
                                </DialogTitle>
                                <DialogDescription>
                                    Preencha os dados do produto
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="nome">Nome *</Label>
                                        <Input
                                            id="nome"
                                            value={formData.nome}
                                            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="categoria">Categoria</Label>
                                        <Select
                                            value={formData.categoriaId}
                                            onValueChange={(value) => setFormData({ ...formData, categoriaId: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categorias?.map((cat: Categoria) => (
                                                    <SelectItem key={cat.id} value={cat.id.toString()}>
                                                        {cat.nome}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="descricao">Descrição</Label>
                                    <Textarea
                                        id="descricao"
                                        value={formData.descricao}
                                        onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                                        rows={2}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="precoCusto">Preço de Custo</Label>
                                        <Input
                                            id="precoCusto"
                                            type="number"
                                            step="0.01"
                                            value={formData.precoCusto}
                                            onChange={(e) => setFormData({ ...formData, precoCusto: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="precoVenda">Preço de Venda *</Label>
                                        <Input
                                            id="precoVenda"
                                            type="number"
                                            step="0.01"
                                            value={formData.precoVenda}
                                            onChange={(e) => setFormData({ ...formData, precoVenda: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="estoqueAtual">Estoque Atual</Label>
                                        <Input
                                            id="estoqueAtual"
                                            type="number"
                                            value={formData.estoqueAtual}
                                            onChange={(e) => setFormData({ ...formData, estoqueAtual: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="estoqueMinimo">Estoque Mínimo</Label>
                                        <Input
                                            id="estoqueMinimo"
                                            type="number"
                                            value={formData.estoqueMinimo}
                                            onChange={(e) => setFormData({ ...formData, estoqueMinimo: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="codigoBarras">Código de Barras</Label>
                                        <Input
                                            id="codigoBarras"
                                            value={formData.codigoBarras}
                                            onChange={(e) => setFormData({ ...formData, codigoBarras: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {editingProduct ? 'Salvar' : 'Criar'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar produtos..."
                                className="pl-8"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Produto</TableHead>
                                    <TableHead className="hidden md:table-cell">Categoria</TableHead>
                                    <TableHead className="text-right hidden sm:table-cell">Preço</TableHead>
                                    <TableHead className="text-center hidden sm:table-cell">Estoque</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell className="max-w-[150px] sm:max-w-none"><Skeleton className="h-4 w-[180px]" /></TableCell>
                                        <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-[120px]" /></TableCell>
                                        <TableCell className="text-right hidden sm:flex justify-end"><Skeleton className="h-4 w-[80px]" /></TableCell>
                                        <TableCell className="text-center justify-center hidden sm:flex"><Skeleton className="h-4 w-[60px]" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-[60px] rounded-full" /></TableCell>
                                        <TableCell className="text-right"><Skeleton className="h-8 w-8 rounded-full ml-auto" /></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Produto</TableHead>
                                    <TableHead className="hidden md:table-cell">Categoria</TableHead>
                                    <TableHead className="text-right hidden sm:table-cell">Preço</TableHead>
                                    <TableHead className="text-center hidden sm:table-cell">Estoque</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data?.data?.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                                            Nenhum produto encontrado
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    data?.data?.map((produto: Produto) => (
                                        <TableRow key={produto.id}>
                                            <TableCell className="font-medium max-w-[150px] sm:max-w-none truncate" title={produto.nome}>{produto.nome}</TableCell>
                                            <TableCell className="hidden md:table-cell">{produto.categoria?.nome || '-'}</TableCell>
                                            <TableCell className="text-right hidden sm:table-cell">
                                                {formatCurrency(produto.precoVenda)}
                                            </TableCell>
                                            <TableCell className="text-center hidden sm:table-cell">
                                                <div className="flex items-center justify-center gap-1">
                                                    {produto.estoqueAtual <= produto.estoqueMinimo && (
                                                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                                    )}
                                                    {produto.estoqueAtual}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={produto.ativo ? 'default' : 'secondary'}>
                                                    {produto.ativo ? 'Ativo' : 'Inativo'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleEdit(produto)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        if (confirm('Deseja remover este produto?')) {
                                                            deleteMutation.mutate(produto.id);
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
        </div>
    );
}
