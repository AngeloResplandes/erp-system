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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Pencil, Trash2, Loader2, Truck } from 'lucide-react';
import { toast } from 'sonner';

interface Fornecedor {
    id: number;
    nome: string;
    cnpj: string | null;
    telefone: string | null;
    email: string | null;
    endereco: string | null;
    ativo: boolean;
}

export default function FornecedoresClientPage() {
    const [search, setSearch] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Fornecedor | null>(null);
    const [formData, setFormData] = useState({
        nome: '',
        cnpj: '',
        telefone: '',
        email: '',
        endereco: '',
    });

    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['fornecedores', search],
        queryFn: async () => {
            const res = await fetch(`/api/fornecedores?search=${search}`);
            return res.json();
        },
    });

    const createMutation = useMutation({
        mutationFn: async (data: typeof formData) => {
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
            resetForm();
            setIsOpen(false);
        },
        onError: () => {
            toast.error('Erro ao criar fornecedor');
        },
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: number; data: typeof formData }) => {
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
            resetForm();
            setIsOpen(false);
        },
        onError: () => {
            toast.error('Erro ao atualizar fornecedor');
        },
    });

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
        onError: () => {
            toast.error('Erro ao remover fornecedor');
        },
    });

    const resetForm = () => {
        setFormData({
            nome: '',
            cnpj: '',
            telefone: '',
            email: '',
            endereco: '',
        });
        setEditingSupplier(null);
    };

    const handleEdit = (fornecedor: Fornecedor) => {
        setEditingSupplier(fornecedor);
        setFormData({
            nome: fornecedor.nome,
            cnpj: fornecedor.cnpj || '',
            telefone: fornecedor.telefone || '',
            email: fornecedor.email || '',
            endereco: fornecedor.endereco || '',
        });
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

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
                        <Truck className="h-6 w-6 sm:h-8 sm:w-8" /> Fornecedores
                    </h1>
                    <p className="text-muted-foreground">
                        Gerencie seus fornecedores
                    </p>
                </div>
                <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
                    <DialogTrigger asChild>
                        <Button className="w-full sm:w-auto">
                            <Plus className="mr-2 h-4 w-4" /> Novo Fornecedor
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <form onSubmit={handleSubmit}>
                            <DialogHeader>
                                <DialogTitle>
                                    {editingSupplier ? 'Editar Fornecedor' : 'Novo Fornecedor'}
                                </DialogTitle>
                                <DialogDescription>
                                    Preencha os dados do fornecedor
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
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
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {editingSupplier ? 'Salvar' : 'Criar'}
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
                                placeholder="Buscar fornecedores..."
                                className="pl-8"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="px-2 sm:px-6">
                    <div className="overflow-x-auto -mx-2 sm:mx-0">
                        {isLoading ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nome</TableHead>
                                        <TableHead className="hidden lg:table-cell">CNPJ</TableHead>
                                        <TableHead className="hidden md:table-cell">Email</TableHead>
                                        <TableHead className="hidden sm:table-cell">Telefone</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right w-[70px]">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-4 w-[180px]" /></TableCell>
                                            <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-[140px]" /></TableCell>
                                            <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-[180px]" /></TableCell>
                                            <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-[120px]" /></TableCell>
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
                                        <TableHead>Nome</TableHead>
                                        <TableHead className="hidden lg:table-cell">CNPJ</TableHead>
                                        <TableHead className="hidden md:table-cell">Email</TableHead>
                                        <TableHead className="hidden sm:table-cell">Telefone</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right w-[70px]">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data?.data?.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center text-muted-foreground">
                                                Nenhum fornecedor encontrado
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        data?.data?.map((fornecedor: Fornecedor) => (
                                            <TableRow key={fornecedor.id}>
                                                <TableCell className="font-medium max-w-[80px] truncate" title={fornecedor.nome}>{fornecedor.nome}</TableCell>
                                                <TableCell className="hidden lg:table-cell">{fornecedor.cnpj || '-'}</TableCell>
                                                <TableCell className="hidden md:table-cell">{fornecedor.email || '-'}</TableCell>
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
                                                            onClick={() => {
                                                                if (confirm('Deseja remover este fornecedor?')) {
                                                                    deleteMutation.mutate(fornecedor.id);
                                                                }
                                                            }}
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
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
