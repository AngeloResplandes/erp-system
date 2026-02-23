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
import { Plus, Pencil, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';

import { PageHeader } from '@/components/page-header';
import { SearchInput } from '@/components/search-input';
import { FormModal } from '@/components/form-modal';
import { ConfirmDialog, useConfirmDialog } from '@/components/confirm-dialog';
import type { Cliente, ClienteFormData } from '@/types';

// Estado inicial do formulário
const initialFormData: ClienteFormData = {
    nome: '',
    email: '',
    telefone: '',
    cpfCnpj: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
};

// Mapeia cliente do banco para dados do formulário
const mapClienteToFormData = (cliente: Cliente): ClienteFormData => ({
    nome: cliente.nome,
    email: cliente.email || '',
    telefone: cliente.telefone || '',
    cpfCnpj: cliente.cpfCnpj || '',
    endereco: cliente.endereco || '',
    cidade: cliente.cidade || '',
    estado: cliente.estado || '',
    cep: cliente.cep || '',
});

export default function ClientesClientPage() {
    const [search, setSearch] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<Cliente | null>(null);
    const [formData, setFormData] = useState<ClienteFormData>(initialFormData);

    const queryClient = useQueryClient();
    const { isOpen: confirmOpen, setIsOpen: setConfirmOpen, confirm, handleConfirm, isLoading: confirmLoading } = useConfirmDialog();

    // Query: Buscar clientes
    const { data, isLoading } = useQuery({
        queryKey: ['clientes', search],
        queryFn: async () => {
            const res = await fetch(`/api/clientes?search=${search}`);
            return res.json();
        },
    });

    // Mutation: Criar
    const createMutation = useMutation({
        mutationFn: async (data: ClienteFormData) => {
            const res = await fetch('/api/clientes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error('Erro ao criar cliente');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clientes'] });
            toast.success('Cliente criado com sucesso!');
            handleCloseModal();
        },
        onError: () => toast.error('Erro ao criar cliente'),
    });

    // Mutation: Atualizar
    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: number; data: ClienteFormData }) => {
            const res = await fetch(`/api/clientes/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error('Erro ao atualizar cliente');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clientes'] });
            toast.success('Cliente atualizado com sucesso!');
            handleCloseModal();
        },
        onError: () => toast.error('Erro ao atualizar cliente'),
    });

    // Mutation: Deletar
    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            const res = await fetch(`/api/clientes/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Erro ao deletar cliente');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clientes'] });
            toast.success('Cliente removido com sucesso!');
        },
        onError: () => toast.error('Erro ao remover cliente'),
    });

    const resetForm = () => {
        setFormData(initialFormData);
        setEditingClient(null);
    };

    const handleCloseModal = () => {
        setIsOpen(false);
        resetForm();
    };

    const handleEdit = (cliente: Cliente) => {
        setEditingClient(cliente);
        setFormData(mapClienteToFormData(cliente));
        setIsOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingClient) {
            updateMutation.mutate({ id: editingClient.id, data: formData });
        } else {
            createMutation.mutate(formData);
        }
    };

    const isSubmitting = createMutation.isPending || updateMutation.isPending;
    const clientes: Cliente[] = data?.data || [];

    return (
        <div className="space-y-6">
            <PageHeader
                title="Clientes"
                icon={Users}
                description="Gerencie seus clientes"
                action={
                    <FormModal
                        isOpen={isOpen}
                        onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}
                        title={editingClient ? 'Editar Cliente' : 'Novo Cliente'}
                        description="Preencha os dados do cliente"
                        isEditing={!!editingClient}
                        isSubmitting={isSubmitting}
                        onSubmit={handleSubmit}
                        trigger={
                            <Button className="w-full sm:w-auto">
                                <Plus className="mr-2 h-4 w-4" /> Novo Cliente
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
                                <Label htmlFor="cpfCnpj">CPF/CNPJ</Label>
                                <Input
                                    id="cpfCnpj"
                                    value={formData.cpfCnpj}
                                    onChange={(e) => setFormData({ ...formData, cpfCnpj: e.target.value })}
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
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="cidade">Cidade</Label>
                                <Input
                                    id="cidade"
                                    value={formData.cidade}
                                    onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="estado">Estado</Label>
                                <Input
                                    id="estado"
                                    maxLength={2}
                                    value={formData.estado}
                                    onChange={(e) => setFormData({ ...formData, estado: e.target.value.toUpperCase() })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="cep">CEP</Label>
                                <Input
                                    id="cep"
                                    value={formData.cep}
                                    onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
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
                        placeholder="Buscar clientes..."
                    />
                </CardHeader>
                <CardContent className="px-2 sm:px-6">
                    <div className="overflow-x-auto -mx-2 sm:mx-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="min-w-30">Nome</TableHead>
                                    <TableHead className="hidden sm:table-cell min-w-36">Email</TableHead>
                                    <TableHead className="hidden sm:table-cell min-w-28">Telefone</TableHead>
                                    <TableHead className="hidden sm:table-cell min-w-20">Cidade/UF</TableHead>
                                    <TableHead className="min-w-16">Status</TableHead>
                                    <TableHead className="text-right w-20">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-4 w-37.5" /></TableCell>
                                            <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-50" /></TableCell>
                                            <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-30" /></TableCell>
                                            <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-25" /></TableCell>
                                            <TableCell><Skeleton className="h-6 w-15 rounded-full" /></TableCell>
                                            <TableCell className="text-right"><Skeleton className="h-8 w-8 rounded-full ml-auto" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : clientes.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                                            Nenhum cliente encontrado
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    clientes.map((cliente) => (
                                        <TableRow key={cliente.id}>
                                            <TableCell className="font-medium max-w-20 truncate" title={cliente.nome}>
                                                {cliente.nome}
                                            </TableCell>
                                            <TableCell className="hidden sm:table-cell max-w-20 truncate" title={cliente.email || undefined}>{cliente.email || '-'}</TableCell>
                                            <TableCell className="hidden sm:table-cell">{cliente.telefone || '-'}</TableCell>
                                            <TableCell className="hidden sm:table-cell max-w-20 truncate">
                                                {cliente.cidade && cliente.estado
                                                    ? `${cliente.cidade}/${cliente.estado}`
                                                    : '-'}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={cliente.ativo ? 'default' : 'secondary'}>
                                                    {cliente.ativo ? 'Ativo' : 'Inativo'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right p-1">
                                                <div className="flex justify-end gap-0">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() => handleEdit(cliente)}
                                                    >
                                                        <Pencil className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() => confirm(() => deleteMutation.mutate(cliente.id))}
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
                title="Remover cliente"
                message="Tem certeza que deseja remover este cliente? Esta ação não pode ser desfeita."
                confirmText="Remover"
                onConfirm={handleConfirm}
                isLoading={confirmLoading}
            />
        </div>
    );
}
