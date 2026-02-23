'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
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
import { Plus, Pencil, Trash2, Package, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

import { PageHeader } from '@/components/page-header';
import { SearchInput } from '@/components/search-input';
import { FormModal } from '@/components/form-modal';
import { ConfirmDialog, useConfirmDialog } from '@/components/confirm-dialog';
import { formatCurrency } from '@/lib/utils';
import type { Produto, Categoria, ProdutoFormData } from '@/types';

// Tipo estendido para produto com categoria
interface ProdutoComCategoria extends Produto {
    categoria?: Pick<Categoria, 'id' | 'nome'> | null;
}

// Estado inicial do formulário
const initialFormData: ProdutoFormData = {
    nome: '',
    descricao: '',
    categoriaId: '',
    precoCusto: '',
    precoVenda: '',
    estoqueAtual: '',
    estoqueMinimo: '5',
    codigoBarras: '',
};

// Mapeia produto do banco para dados do formulário
const mapProdutoToFormData = (produto: ProdutoComCategoria): ProdutoFormData => ({
    nome: produto.nome,
    descricao: produto.descricao || '',
    categoriaId: produto.categoria?.id?.toString() || '',
    precoCusto: produto.precoCusto,
    precoVenda: produto.precoVenda,
    estoqueAtual: produto.estoqueAtual.toString(),
    estoqueMinimo: produto.estoqueMinimo.toString(),
    codigoBarras: produto.codigoBarras || '',
});

export default function ProdutosClientPage() {
    const [search, setSearch] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<ProdutoComCategoria | null>(null);
    const [formData, setFormData] = useState<ProdutoFormData>(initialFormData);

    const queryClient = useQueryClient();
    const { isOpen: confirmOpen, setIsOpen: setConfirmOpen, confirm, handleConfirm, isLoading: confirmLoading } = useConfirmDialog();

    // Query: Buscar produtos
    const { data, isLoading } = useQuery({
        queryKey: ['produtos', search],
        queryFn: async () => {
            const res = await fetch(`/api/produtos?search=${search}`);
            return res.json();
        },
    });

    // Query: Buscar categorias
    const { data: categorias } = useQuery({
        queryKey: ['categorias'],
        queryFn: async () => {
            const res = await fetch('/api/categorias');
            return res.json();
        },
    });

    // Mutation: Criar
    const createMutation = useMutation({
        mutationFn: async (data: ProdutoFormData) => {
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
            handleCloseModal();
        },
        onError: () => toast.error('Erro ao criar produto'),
    });

    // Mutation: Atualizar
    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: number; data: ProdutoFormData }) => {
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
            handleCloseModal();
        },
        onError: () => toast.error('Erro ao atualizar produto'),
    });

    // Mutation: Deletar
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
        onError: () => toast.error('Erro ao remover produto'),
    });

    const resetForm = () => {
        setFormData(initialFormData);
        setEditingProduct(null);
    };

    const handleCloseModal = () => {
        setIsOpen(false);
        resetForm();
    };

    const handleEdit = (produto: ProdutoComCategoria) => {
        setEditingProduct(produto);
        setFormData(mapProdutoToFormData(produto));
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

    const isSubmitting = createMutation.isPending || updateMutation.isPending;
    const produtos: ProdutoComCategoria[] = data?.data || [];
    const categoriasData: Categoria[] = categorias || [];

    return (
        <div className="space-y-6">
            <PageHeader
                title="Produtos"
                icon={Package}
                description="Gerencie seus produtos e estoque"
                action={
                    <FormModal
                        isOpen={isOpen}
                        onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}
                        title={editingProduct ? 'Editar Produto' : 'Novo Produto'}
                        description="Preencha os dados do produto"
                        isEditing={!!editingProduct}
                        isSubmitting={isSubmitting}
                        onSubmit={handleSubmit}
                        trigger={
                            <Button className="w-full sm:w-auto">
                                <Plus className="mr-2 h-4 w-4" /> Novo Produto
                            </Button>
                        }
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                                        {categoriasData.map((cat) => (
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                    </FormModal>
                }
            />

            <Card>
                <CardHeader>
                    <SearchInput
                        value={search}
                        onChange={setSearch}
                        placeholder="Buscar produtos..."
                    />
                </CardHeader>
                <CardContent className="px-2 sm:px-6">
                    <div className="overflow-x-auto -mx-2 sm:mx-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="min-w-35">Produto</TableHead>
                                    <TableHead className="hidden sm:table-cell min-w-25">Categoria</TableHead>
                                    <TableHead className="hidden sm:table-cell text-right min-w-20">Preço</TableHead>
                                    <TableHead className="hidden sm:table-cell text-center min-w-17.5">Estoque</TableHead>
                                    <TableHead className="min-w-15">Status</TableHead>
                                    <TableHead className="text-right w-17.5">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-4 w-45" /></TableCell>
                                            <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-30" /></TableCell>
                                            <TableCell className="hidden sm:table-cell text-right"><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                                            <TableCell className="hidden sm:table-cell text-center"><Skeleton className="h-4 w-15 mx-auto" /></TableCell>
                                            <TableCell><Skeleton className="h-6 w-15 rounded-full" /></TableCell>
                                            <TableCell className="text-right"><Skeleton className="h-8 w-8 rounded-full ml-auto" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : produtos.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                                            Nenhum produto encontrado
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    produtos.map((produto) => (
                                        <TableRow key={produto.id}>
                                            <TableCell className="font-medium max-w-20 truncate" title={produto.nome}>
                                                {produto.nome}
                                            </TableCell>
                                            <TableCell className="hidden sm:table-cell max-w-20 truncate">{produto.categoria?.nome || '-'}</TableCell>
                                            <TableCell className="hidden sm:table-cell text-right">
                                                {formatCurrency(produto.precoVenda)}
                                            </TableCell>
                                            <TableCell className="hidden sm:table-cell text-center">
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
                                            <TableCell className="text-right p-1">
                                                <div className="flex justify-end gap-0">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() => handleEdit(produto)}
                                                    >
                                                        <Pencil className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() => confirm(() => deleteMutation.mutate(produto.id))}
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

            <ConfirmDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                title="Remover produto"
                message="Tem certeza que deseja remover este produto? Esta ação não pode ser desfeita."
                confirmText="Remover"
                onConfirm={handleConfirm}
                isLoading={confirmLoading}
            />
        </div>
    );
}
