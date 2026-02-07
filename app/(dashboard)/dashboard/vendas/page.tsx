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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
    ShoppingCart,
    Plus,
    Minus,
    Trash2,
    Search,
    CreditCard,
    Banknote,
    QrCode,
    Receipt,
    Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

interface Produto {
    id: number;
    nome: string;
    precoVenda: string;
    estoqueAtual: number;
}

interface Cliente {
    id: number;
    nome: string;
}

interface CartItem {
    produto: Produto;
    quantidade: number;
    precoUnitario: number;
    desconto: number;
}

const formasPagamento = [
    { value: 'dinheiro', label: 'Dinheiro', icon: Banknote },
    { value: 'pix', label: 'PIX', icon: QrCode },
    { value: 'cartao_credito', label: 'Cartão Crédito', icon: CreditCard },
    { value: 'cartao_debito', label: 'Cartão Débito', icon: CreditCard },
];

export default function VendasPage() {
    const [search, setSearch] = useState('');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [selectedCliente, setSelectedCliente] = useState<string>('');
    const [formaPagamento, setFormaPagamento] = useState<string>('');
    const [desconto, setDesconto] = useState(0);

    const queryClient = useQueryClient();

    const { data: produtos, isLoading: loadingProducts } = useQuery({
        queryKey: ['produtos', search],
        queryFn: async () => {
            const res = await fetch(`/api/produtos?search=${search}&limit=100`);
            return res.json();
        },
    });

    const { data: clientes } = useQuery({
        queryKey: ['clientes-list'],
        queryFn: async () => {
            const res = await fetch('/api/clientes?limit=100');
            return res.json();
        },
    });

    const createSaleMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch('/api/vendas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    clienteId: selectedCliente ? parseInt(selectedCliente) : null,
                    itens: cart.map((item) => ({
                        produtoId: item.produto.id,
                        quantidade: item.quantidade,
                        precoUnitario: item.precoUnitario,
                        desconto: item.desconto,
                    })),
                    formaPagamento,
                    desconto,
                }),
            });
            if (!res.ok) throw new Error('Erro ao criar venda');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['produtos'] });
            queryClient.invalidateQueries({ queryKey: ['vendas'] });
            toast.success('Venda realizada com sucesso!');
            setCart([]);
            setSelectedCliente('');
            setFormaPagamento('');
            setDesconto(0);
        },
        onError: () => {
            toast.error('Erro ao realizar venda');
        },
    });

    const addToCart = (produto: Produto) => {
        const existing = cart.find((item) => item.produto.id === produto.id);
        if (existing) {
            if (existing.quantidade >= produto.estoqueAtual) {
                toast.error('Estoque insuficiente');
                return;
            }
            setCart(
                cart.map((item) =>
                    item.produto.id === produto.id
                        ? { ...item, quantidade: item.quantidade + 1 }
                        : item
                )
            );
        } else {
            if (produto.estoqueAtual < 1) {
                toast.error('Produto sem estoque');
                return;
            }
            setCart([
                ...cart,
                {
                    produto,
                    quantidade: 1,
                    precoUnitario: parseFloat(produto.precoVenda),
                    desconto: 0,
                },
            ]);
        }
    };

    const updateQuantity = (produtoId: number, delta: number) => {
        setCart(
            cart
                .map((item) => {
                    if (item.produto.id !== produtoId) return item;
                    const newQty = item.quantidade + delta;
                    if (newQty <= 0) return null;
                    if (newQty > item.produto.estoqueAtual) {
                        toast.error('Estoque insuficiente');
                        return item;
                    }
                    return { ...item, quantidade: newQty };
                })
                .filter(Boolean) as CartItem[]
        );
    };

    const removeFromCart = (produtoId: number) => {
        setCart(cart.filter((item) => item.produto.id !== produtoId));
    };

    const subtotal = cart.reduce(
        (acc, item) => acc + item.quantidade * item.precoUnitario - item.desconto,
        0
    );
    const total = subtotal - desconto;

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value);
    };

    const canFinalize = cart.length > 0 && formaPagamento;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <ShoppingCart className="h-8 w-8" /> PDV - Ponto de Venda
                </h1>
                <p className="text-muted-foreground">
                    Realize vendas de forma rápida e eficiente
                </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Products List */}
                <div className="lg:col-span-2 space-y-4">
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar produtos..."
                                    className="pl-8"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </CardHeader>
                        <CardContent>
                            {loadingProducts ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {[1, 2, 3, 4, 5, 6].map((i) => (
                                        <Skeleton key={i} className="h-24" />
                                    ))}
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[500px] overflow-y-auto">
                                    {produtos?.data?.map((produto: Produto) => (
                                        <button
                                            key={produto.id}
                                            onClick={() => addToCart(produto)}
                                            className="p-3 border rounded-lg text-left hover:bg-accent transition-colors disabled:opacity-50"
                                            disabled={produto.estoqueAtual < 1}
                                        >
                                            <div className="font-medium text-sm truncate">
                                                {produto.nome}
                                            </div>
                                            <div className="text-lg font-bold text-primary">
                                                {formatCurrency(parseFloat(produto.precoVenda))}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                Estoque: {produto.estoqueAtual}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Cart */}
                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Receipt className="h-5 w-5" /> Carrinho
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Cliente */}
                            <div>
                                <label className="text-sm font-medium">Cliente (opcional)</label>
                                <Select value={selectedCliente} onValueChange={setSelectedCliente}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {clientes?.data?.map((cliente: Cliente) => (
                                            <SelectItem key={cliente.id} value={cliente.id.toString()}>
                                                {cliente.nome}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <Separator />

                            {/* Cart Items */}
                            <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                {cart.length === 0 ? (
                                    <p className="text-center text-muted-foreground py-4">
                                        Carrinho vazio
                                    </p>
                                ) : (
                                    cart.map((item) => (
                                        <div
                                            key={item.produto.id}
                                            className="flex items-center justify-between p-2 border rounded"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-sm truncate">
                                                    {item.produto.nome}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {formatCurrency(item.precoUnitario)} x {item.quantidade}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-6 w-6"
                                                    onClick={() => updateQuantity(item.produto.id, -1)}
                                                >
                                                    <Minus className="h-3 w-3" />
                                                </Button>
                                                <span className="w-8 text-center text-sm">
                                                    {item.quantidade}
                                                </span>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-6 w-6"
                                                    onClick={() => updateQuantity(item.produto.id, 1)}
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6"
                                                    onClick={() => removeFromCart(item.produto.id)}
                                                >
                                                    <Trash2 className="h-3 w-3 text-destructive" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <Separator />

                            {/* Payment Method */}
                            <div>
                                <label className="text-sm font-medium">Forma de Pagamento</label>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    {formasPagamento.map((forma) => (
                                        <button
                                            key={forma.value}
                                            onClick={() => setFormaPagamento(forma.value)}
                                            className={`p-2 border rounded flex items-center gap-2 text-sm transition-colors ${formaPagamento === forma.value
                                                    ? 'border-primary bg-primary/10'
                                                    : 'hover:bg-accent'
                                                }`}
                                        >
                                            <forma.icon className="h-4 w-4" />
                                            {forma.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <Separator />

                            {/* Totals */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Subtotal:</span>
                                    <span>{formatCurrency(subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Desconto:</span>
                                    <Input
                                        type="number"
                                        className="w-24 h-8 text-right"
                                        value={desconto}
                                        onChange={(e) => setDesconto(parseFloat(e.target.value) || 0)}
                                    />
                                </div>
                                <div className="flex justify-between text-lg font-bold">
                                    <span>Total:</span>
                                    <span className="text-primary">{formatCurrency(total)}</span>
                                </div>
                            </div>

                            <Button
                                className="w-full"
                                size="lg"
                                disabled={!canFinalize || createSaleMutation.isPending}
                                onClick={() => createSaleMutation.mutate()}
                            >
                                {createSaleMutation.isPending && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Finalizar Venda
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
