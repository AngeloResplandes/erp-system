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

export default function FornecedoresPage() {
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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <Truck className="h-8 w-8" /> Fornecedores
                    </h1>
                    <p className="text-muted-foreground">
                        Gerencie seus fornecedores
                    </p>
                </div>
                <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
                    <DialogTrigger asChild>
                        <Button>
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
                                        <Label htmlFor="cnpj">CNPJ</Label>
                                        <Input
                                            id="cnpj"
                                            value={formData.cnpj}
                                            onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
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
                <CardContent>
                    {isLoading ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nome</TableHead>
                                    <TableHead>CNPJ</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Telefone</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-4 w-[180px]" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-[140px]" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-[180px]" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
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
                                    <TableHead>CNPJ</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Telefone</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Ações</TableHead>
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
                                            <TableCell className="font-medium">{fornecedor.nome}</TableCell>
                                            <TableCell>{fornecedor.cnpj || '-'}</TableCell>
                                            <TableCell>{fornecedor.email || '-'}</TableCell>
                                            <TableCell>{fornecedor.telefone || '-'}</TableCell>
                                            <TableCell>
                                                <Badge variant={fornecedor.ativo ? 'default' : 'secondary'}>
                                                    {fornecedor.ativo ? 'Ativo' : 'Inativo'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleEdit(fornecedor)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        if (confirm('Deseja remover este fornecedor?')) {
                                                            deleteMutation.mutate(fornecedor.id);
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
