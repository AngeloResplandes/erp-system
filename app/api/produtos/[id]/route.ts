import { NextResponse } from 'next/server';
import { db } from '@/db';
import { produtos } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { produtoSchema } from '@/lib/validations';

interface Params {
    params: Promise<{ id: string }>;
}

// GET - Get single product
export async function GET(request: Request, { params }: Params) {
    try {
        const { id } = await params;
        const produto = await db.query.produtos.findFirst({
            where: eq(produtos.id, parseInt(id)),
            with: { categoria: true },
        });

        if (!produto) {
            return NextResponse.json(
                { error: 'Produto não encontrado' },
                { status: 404 }
            );
        }

        return NextResponse.json(produto);
    } catch (error) {
        console.error('Error fetching product:', error);
        return NextResponse.json(
            { error: 'Erro ao buscar produto' },
            { status: 500 }
        );
    }
}

// PUT - Update product
export async function PUT(request: Request, { params }: Params) {
    try {
        const { id } = await params;
        const body = await request.json();

        const result = produtoSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json(
                { error: 'Dados inválidos', details: result.error.flatten() },
                { status: 400 }
            );
        }

        const [updated] = await db
            .update(produtos)
            .set({ ...result.data, atualizadoEm: new Date() })
            .where(eq(produtos.id, parseInt(id)))
            .returning();

        if (!updated) {
            return NextResponse.json(
                { error: 'Produto não encontrado' },
                { status: 404 }
            );
        }

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Error updating product:', error);
        return NextResponse.json(
            { error: 'Erro ao atualizar produto' },
            { status: 500 }
        );
    }
}

// DELETE - Delete product
export async function DELETE(request: Request, { params }: Params) {
    try {
        const { id } = await params;

        const [deleted] = await db
            .delete(produtos)
            .where(eq(produtos.id, parseInt(id)))
            .returning();

        if (!deleted) {
            return NextResponse.json(
                { error: 'Produto não encontrado' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting product:', error);
        return NextResponse.json(
            { error: 'Erro ao deletar produto' },
            { status: 500 }
        );
    }
}
