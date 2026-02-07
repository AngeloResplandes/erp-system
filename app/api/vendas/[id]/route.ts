import { NextResponse } from 'next/server';
import { db } from '@/db';
import { vendas, itensVenda, produtos } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

interface Params {
    params: Promise<{ id: string }>;
}

// GET - Get single sale
export async function GET(request: Request, { params }: Params) {
    try {
        const { id } = await params;
        const venda = await db.query.vendas.findFirst({
            where: eq(vendas.id, parseInt(id)),
            with: {
                cliente: true,
                usuario: { columns: { id: true, nome: true } },
                itens: {
                    with: { produto: true },
                },
            },
        });

        if (!venda) {
            return NextResponse.json(
                { error: 'Venda não encontrada' },
                { status: 404 }
            );
        }

        return NextResponse.json(venda);
    } catch (error) {
        console.error('Error fetching sale:', error);
        return NextResponse.json(
            { error: 'Erro ao buscar venda' },
            { status: 500 }
        );
    }
}

// DELETE - Cancel sale (restore stock)
export async function DELETE(request: Request, { params }: Params) {
    try {
        const { id } = await params;
        const vendaId = parseInt(id);

        // Get sale items to restore stock
        const items = await db.query.itensVenda.findMany({
            where: eq(itensVenda.vendaId, vendaId),
        });

        // Restore stock
        for (const item of items) {
            await db
                .update(produtos)
                .set({
                    estoqueAtual: sql`${produtos.estoqueAtual} + ${item.quantidade}`,
                })
                .where(eq(produtos.id, item.produtoId));
        }

        // Update sale status to cancelled
        const [updated] = await db
            .update(vendas)
            .set({ status: 'cancelada' })
            .where(eq(vendas.id, vendaId))
            .returning();

        if (!updated) {
            return NextResponse.json(
                { error: 'Venda não encontrada' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error cancelling sale:', error);
        return NextResponse.json(
            { error: 'Erro ao cancelar venda' },
            { status: 500 }
        );
    }
}
