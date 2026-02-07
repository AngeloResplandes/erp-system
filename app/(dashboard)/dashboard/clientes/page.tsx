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
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Pencil, Trash2, Loader2, Users } from 'lucide-react';
import { toast } from 'sonner';

interface Cliente {
    id: number;
    nome: string;
    email: string | null;
    telefone: string | null;
    cpfCnpj: string | null;
    cidade: string | null;
    estado: string | null;
    ativo: boolean;
}

export default function ClientesPage() {
    const [search, setSearch] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<Cliente | null>(null);
    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        telefone: '',
        cpfCnpj: '',
        endereco: '',
        cidade: '',
        estado: '',
        cep: '',
    });

    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['clientes', search],
        queryFn: async () => {
            const res = await fetch(`/api/clientes?search=${search}`);
            return res.json();
        },
    });

    const createMutation = useMutation({
        mutationFn: async (data: typeof formData) => {
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
            resetForm();
            setIsOpen(false);
        },
        onError: () => {
            toast.error('Erro ao criar cliente');
        },
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: number; data: typeof formData }) => {
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
            resetForm();
            setIsOpen(false);
        },
        onError: () => {
            toast.error('Erro ao atualizar cliente');
        },
    });

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
        onError: () => {
            toast.error('Erro ao remover cliente');
        },
    });

    const resetForm = () => {
        setFormData({
            nome: '',
            email: '',
            telefone: '',
            cpfCnpj: '',
            endereco: '',
            cidade: '',
            estado: '',
            cep: '',
        });
        setEditingClient(null);
    };

    const handleEdit = (cliente: Cliente) => {
        setEditingClient(cliente);
        setFormData({
            nome: cliente.nome,
            email: cliente.email || '',
            telefone: cliente.telefone || '',
            cpfCnpj: cliente.cpfCnpj || '',
            endereco: '',
            cidade: cliente.cidade || '',
            estado: cliente.estado || '',
            cep: '',
        });
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

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <Users className="h-8 w-8" /> Clientes
                    </h1>
                    <p className="text-muted-foreground">
                        Gerencie seus clientes
                    </p>
                </div>
                <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Novo Cliente
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                        <form onSubmit={handleSubmit}>
                            <DialogHeader>
                                <DialogTitle>
                                    {editingClient ? 'Editar Cliente' : 'Novo Cliente'}
                                </DialogTitle>
                                <DialogDescription>
                                    Preencha os dados do cliente
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
                                        <Label htmlFor="cpfCnpj">CPF/CNPJ</Label>
                                        <Input
                                            id="cpfCnpj"
                                            value={formData.cpfCnpj}
                                            onChange={(e) => setFormData({ ...formData, cpfCnpj: e.target.value })}
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
                                <div className="grid grid-cols-3 gap-4">
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
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {editingClient ? 'Salvar' : 'Criar'}
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
                                placeholder="Buscar clientes..."
                                className="pl-8"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-2">
                            {[1, 2, 3].map((i) => (
                                <Skeleton key={i} className="h-12 w-full" />
                            ))}
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nome</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Telefone</TableHead>
                                    <TableHead>Cidade/UF</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data?.data?.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                                            Nenhum cliente encontrado
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    data?.data?.map((cliente: Cliente) => (
                                        <TableRow key={cliente.id}>
                                            <TableCell className="font-medium">{cliente.nome}</TableCell>
                                            <TableCell>{cliente.email || '-'}</TableCell>
                                            <TableCell>{cliente.telefone || '-'}</TableCell>
                                            <TableCell>
                                                {cliente.cidade && cliente.estado
                                                    ? `${cliente.cidade}/${cliente.estado}`
                                                    : '-'}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={cliente.ativo ? 'default' : 'secondary'}>
                                                    {cliente.ativo ? 'Ativo' : 'Inativo'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleEdit(cliente)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        if (confirm('Deseja remover este cliente?')) {
                                                            deleteMutation.mutate(cliente.id);
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
