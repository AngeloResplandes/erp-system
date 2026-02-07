import { NextResponse } from 'next/server';
import { db } from '@/db';
import { clientes } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { clienteSchema } from '@/lib/validations';

interface Params {
    params: Promise<{ id: string }>;
}

// GET - Get single client
export async function GET(request: Request, { params }: Params) {
    try {
        const { id } = await params;
        const cliente = await db.query.clientes.findFirst({
            where: eq(clientes.id, parseInt(id)),
        });

        if (!cliente) {
            return NextResponse.json(
                { error: 'Cliente não encontrado' },
                { status: 404 }
            );
        }

        return NextResponse.json(cliente);
    } catch (error) {
        console.error('Error fetching client:', error);
        return NextResponse.json(
            { error: 'Erro ao buscar cliente' },
            { status: 500 }
        );
    }
}

// PUT - Update client
export async function PUT(request: Request, { params }: Params) {
    try {
        const { id } = await params;
        const body = await request.json();

        const result = clienteSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json(
                { error: 'Dados inválidos', details: result.error.flatten() },
                { status: 400 }
            );
        }

        const [updated] = await db
            .update(clientes)
            .set({ ...result.data, atualizadoEm: new Date() })
            .where(eq(clientes.id, parseInt(id)))
            .returning();

        if (!updated) {
            return NextResponse.json(
                { error: 'Cliente não encontrado' },
                { status: 404 }
            );
        }

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Error updating client:', error);
        return NextResponse.json(
            { error: 'Erro ao atualizar cliente' },
            { status: 500 }
        );
    }
}

// DELETE - Delete client
export async function DELETE(request: Request, { params }: Params) {
    try {
        const { id } = await params;

        const [deleted] = await db
            .delete(clientes)
            .where(eq(clientes.id, parseInt(id)))
            .returning();

        if (!deleted) {
            return NextResponse.json(
                { error: 'Cliente não encontrado' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting client:', error);
        return NextResponse.json(
            { error: 'Erro ao deletar cliente' },
            { status: 500 }
        );
    }
}
