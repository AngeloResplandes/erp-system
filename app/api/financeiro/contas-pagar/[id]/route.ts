import { NextResponse } from 'next/server';
import { db } from '@/db';
import { contasPagar } from '@/db/schema';
import { eq } from 'drizzle-orm';

interface Params {
    params: Promise<{ id: string }>;
}

// PUT - Mark account as paid
export async function PUT(request: Request, { params }: Params) {
    try {
        const { id } = await params;
        const body = await request.json();

        const [updated] = await db
            .update(contasPagar)
            .set({
                status: body.status || 'pago',
                dataPagamento: body.dataPagamento || new Date().toISOString().split('T')[0],
            })
            .where(eq(contasPagar.id, parseInt(id)))
            .returning();

        if (!updated) {
            return NextResponse.json(
                { error: 'Conta não encontrada' },
                { status: 404 }
            );
        }

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Error updating account payable:', error);
        return NextResponse.json(
            { error: 'Erro ao atualizar conta' },
            { status: 500 }
        );
    }
}

// DELETE - Delete account payable
export async function DELETE(request: Request, { params }: Params) {
    try {
        const { id } = await params;

        const [deleted] = await db
            .delete(contasPagar)
            .where(eq(contasPagar.id, parseInt(id)))
            .returning();

        if (!deleted) {
            return NextResponse.json(
                { error: 'Conta não encontrada' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting account payable:', error);
        return NextResponse.json(
            { error: 'Erro ao deletar conta' },
            { status: 500 }
        );
    }
}
