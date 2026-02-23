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
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Truck } from 'lucide-react';
import { toast } from 'sonner';

import { PageHeader } from '@/components/page-header';
import { SearchInput } from '@/components/search-input';
import { FormModal } from '@/components/form-modal';
import { ConfirmDialog, useConfirmDialog } from '@/components/confirm-dialog';
import type { Fornecedor, FornecedorFormData } from '@/types';

// Estado inicial do formulário
const initialFormData: FornecedorFormData = {
    nome: '',
    cnpj: '',
    telefone: '',
    email: '',
    endereco: '',
};

// Mapeia fornecedor do banco para dados do formulário
const mapFornecedorToFormData = (fornecedor: Fornecedor): FornecedorFormData => ({
    nome: fornecedor.nome,
    cnpj: fornecedor.cnpj || '',
    telefone: fornecedor.telefone || '',
    email: fornecedor.email || '',
    endereco: fornecedor.endereco || '',
});

export default function FornecedoresClientPage() {
    const [search, setSearch] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Fornecedor | null>(null);
    const [formData, setFormData] = useState<FornecedorFormData>(initialFormData);

    const queryClient = useQueryClient();
    const { isOpen: confirmOpen, setIsOpen: setConfirmOpen, confirm, handleConfirm, isLoading: confirmLoading } = useConfirmDialog();

    // Query: Buscar fornecedores
    const { data, isLoading } = useQuery({
        queryKey: ['fornecedores', search],
        queryFn: async () => {
            const res = await fetch(`/api/fornecedores?search=${search}`);
            return res.json();
        },
    });

    // Mutation: Criar
    const createMutation = useMutation({
        mutationFn: async (data: FornecedorFormData) => {
            const res = await fetch('/api/fornecedores', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error('Erro ao criar fornecedor');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['fornecedores'] });
            toast.success('Fornecedor criado com sucesso!');
            handleCloseModal();
        },
        onError: () => toast.error('Erro ao criar fornecedor'),
    });

    // Mutation: Atualizar
    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: number; data: FornecedorFormData }) => {
            const res = await fetch(`/api/fornecedores/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error('Erro ao atualizar fornecedor');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['fornecedores'] });
            toast.success('Fornecedor atualizado com sucesso!');
            handleCloseModal();
        },
        onError: () => toast.error('Erro ao atualizar fornecedor'),
    });

    // Mutation: Deletar
    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            const res = await fetch(`/api/fornecedores/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Erro ao deletar fornecedor');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['fornecedores'] });
            toast.success('Fornecedor removido com sucesso!');
        },
        onError: () => toast.error('Erro ao remover fornecedor'),
    });

    const resetForm = () => {
        setFormData(initialFormData);
        setEditingSupplier(null);
    };

    const handleCloseModal = () => {
        setIsOpen(false);
        resetForm();
    };

    const handleEdit = (fornecedor: Fornecedor) => {
        setEditingSupplier(fornecedor);
        setFormData(mapFornecedorToFormData(fornecedor));
        setIsOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingSupplier) {
            updateMutation.mutate({ id: editingSupplier.id, data: formData });
        } else {
            createMutation.mutate(formData);
        }
    };

    const isSubmitting = createMutation.isPending || updateMutation.isPending;
    const fornecedores: Fornecedor[] = data?.data || [];

    return (
        <div className="space-y-6">
            <PageHeader
                title="Fornecedores"
                icon={Truck}
                description="Gerencie seus fornecedores"
                action={
                    <FormModal
                        isOpen={isOpen}
                        onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}
                        title={editingSupplier ? 'Editar Fornecedor' : 'Novo Fornecedor'}
                        description="Preencha os dados do fornecedor"
                        isEditing={!!editingSupplier}
                        isSubmitting={isSubmitting}
                        onSubmit={handleSubmit}
                        maxWidth="sm:max-w-[500px]"
                        trigger={
                            <Button className="w-full sm:w-auto">
                                <Plus className="mr-2 h-4 w-4" /> Novo Fornecedor
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
                                <Label htmlFor="cnpj">CNPJ</Label>
                                <Input
                                    id="cnpj"
                                    value={formData.cnpj}
                                    onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="telefone">Telefone</Label>
                                <Input
                                    id="telefone"
                                    value={formData.telefone}
                                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="endereco">Endereço</Label>
                            <Input
                                id="endereco"
                                value={formData.endereco}
                                onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                            />
                        </div>
                    </FormModal>
                }
            />

            <Card>
                <CardHeader>
                    <SearchInput
                        value={search}
                        onChange={setSearch}
                        placeholder="Buscar fornecedores..."
                    />
                </CardHeader>
                <CardContent className="px-2 sm:px-6">
                    <div className="overflow-x-auto -mx-2 sm:mx-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="min-w-35">Nome</TableHead>
                                    <TableHead className="hidden sm:table-cell min-w-32">CNPJ</TableHead>
                                    <TableHead className="hidden sm:table-cell min-w-35">Email</TableHead>
                                    <TableHead className="hidden sm:table-cell min-w-28">Telefone</TableHead>
                                    <TableHead className="min-w-16">Status</TableHead>
                                    <TableHead className="text-right w-20">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-4 w-45" /></TableCell>
                                            <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-35" /></TableCell>
                                            <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-45" /></TableCell>
                                            <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-30" /></TableCell>
                                            <TableCell><Skeleton className="h-6 w-15 rounded-full" /></TableCell>
                                            <TableCell className="text-right"><Skeleton className="h-8 w-8 rounded-full ml-auto" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : fornecedores.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                                            Nenhum fornecedor encontrado
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    fornecedores.map((fornecedor) => (
                                        <TableRow key={fornecedor.id}>
                                            <TableCell className="font-medium max-w-20 truncate" title={fornecedor.nome}>
                                                {fornecedor.nome}
                                            </TableCell>
                                            <TableCell className="hidden sm:table-cell">{fornecedor.cnpj || '-'}</TableCell>
                                            <TableCell className="hidden sm:table-cell max-w-20 truncate" title={fornecedor.email || undefined}>{fornecedor.email || '-'}</TableCell>
                                            <TableCell className="hidden sm:table-cell">{fornecedor.telefone || '-'}</TableCell>
                                            <TableCell>
                                                <Badge variant={fornecedor.ativo ? 'default' : 'secondary'}>
                                                    {fornecedor.ativo ? 'Ativo' : 'Inativo'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right p-1">
                                                <div className="flex justify-end gap-0">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() => handleEdit(fornecedor)}
                                                    >
                                                        <Pencil className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() => confirm(() => deleteMutation.mutate(fornecedor.id))}
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
                title="Remover fornecedor"
                message="Tem certeza que deseja remover este fornecedor? Esta ação não pode ser desfeita."
                confirmText="Remover"
                onConfirm={handleConfirm}
                isLoading={confirmLoading}
            />
        </div>
    );
}
