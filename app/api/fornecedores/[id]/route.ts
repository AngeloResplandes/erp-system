import { NextResponse } from 'next/server';
import { db } from '@/db';
import { fornecedores } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { fornecedorSchema } from '@/lib/validations';

interface Params {
    params: Promise<{ id: string }>;
}

// GET - Get single supplier
export async function GET(request: Request, { params }: Params) {
    try {
        const { id } = await params;
        const fornecedor = await db.query.fornecedores.findFirst({
            where: eq(fornecedores.id, parseInt(id)),
        });

        if (!fornecedor) {
            return NextResponse.json(
                { error: 'Fornecedor não encontrado' },
                { status: 404 }
            );
        }

        return NextResponse.json(fornecedor);
    } catch (error) {
        console.error('Error fetching supplier:', error);
        return NextResponse.json(
            { error: 'Erro ao buscar fornecedor' },
            { status: 500 }
        );
    }
}

// PUT - Update supplier
export async function PUT(request: Request, { params }: Params) {
    try {
        const { id } = await params;
        const body = await request.json();

        const result = fornecedorSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json(
                { error: 'Dados inválidos', details: result.error.flatten() },
                { status: 400 }
            );
        }

        const [updated] = await db
            .update(fornecedores)
            .set(result.data)
            .where(eq(fornecedores.id, parseInt(id)))
            .returning();

        if (!updated) {
            return NextResponse.json(
                { error: 'Fornecedor não encontrado' },
                { status: 404 }
            );
        }

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Error updating supplier:', error);
        return NextResponse.json(
            { error: 'Erro ao atualizar fornecedor' },
            { status: 500 }
        );
    }
}

// DELETE - Delete supplier
export async function DELETE(request: Request, { params }: Params) {
    try {
        const { id } = await params;

        const [deleted] = await db
            .delete(fornecedores)
            .where(eq(fornecedores.id, parseInt(id)))
            .returning();

        if (!deleted) {
            return NextResponse.json(
                { error: 'Fornecedor não encontrado' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting supplier:', error);
        return NextResponse.json(
            { error: 'Erro ao deletar fornecedor' },
            { status: 500 }
        );
    }
}
