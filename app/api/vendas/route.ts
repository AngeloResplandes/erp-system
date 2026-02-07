import { NextResponse } from 'next/server';
import { db } from '@/db';
import { vendas, itensVenda, produtos } from '@/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { getSession } from '@/lib/auth';
import { vendaSchema } from '@/lib/validations';

// GET - List all sales
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const offset = (page - 1) * limit;

        const data = await db.query.vendas.findMany({
            with: {
                cliente: true,
                usuario: { columns: { id: true, nome: true } },
                itens: {
                    with: { produto: true },
                },
            },
            orderBy: desc(vendas.criadoEm),
            limit,
            offset,
        });

        const total = await db.$count(vendas);

        return NextResponse.json({
            data,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Error fetching sales:', error);
        return NextResponse.json(
            { error: 'Erro ao buscar vendas' },
            { status: 500 }
        );
    }
}

// POST - Create new sale
export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
        }

        const body = await request.json();

        const result = vendaSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json(
                { error: 'Dados inválidos', details: result.error.flatten() },
                { status: 400 }
            );
        }

        const { clienteId, itens, formaPagamento, desconto, observacoes } = result.data;

        // Calculate totals
        let subtotal = 0;
        for (const item of itens) {
            subtotal += item.quantidade * item.precoUnitario - item.desconto;
        }
        const total = subtotal - desconto;

        // Create sale
        const [newSale] = await db
            .insert(vendas)
            .values({
                clienteId: clienteId || null,
                usuarioId: session.userId,
                status: 'finalizada',
                subtotal: subtotal.toString(),
                desconto: desconto.toString(),
                total: total.toString(),
                formaPagamento,
                observacoes: observacoes || null,
            })
            .returning();

        // Create sale items and update stock
        for (const item of itens) {
            const itemSubtotal = item.quantidade * item.precoUnitario - item.desconto;

            await db.insert(itensVenda).values({
                vendaId: newSale.id,
                produtoId: item.produtoId,
                quantidade: item.quantidade,
                precoUnitario: item.precoUnitario.toString(),
                desconto: item.desconto.toString(),
                subtotal: itemSubtotal.toString(),
            });

            // Update product stock
            await db
                .update(produtos)
                .set({
                    estoqueAtual: sql`${produtos.estoqueAtual} - ${item.quantidade}`,
                })
                .where(eq(produtos.id, item.produtoId));
        }

        return NextResponse.json(newSale, { status: 201 });
    } catch (error) {
        console.error('Error creating sale:', error);
        return NextResponse.json(
            { error: 'Erro ao criar venda' },
            { status: 500 }
        );
    }
}
