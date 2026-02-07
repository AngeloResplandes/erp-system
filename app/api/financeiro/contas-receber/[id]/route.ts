import { NextResponse } from 'next/server';
import { db } from '@/db';
import { contasReceber } from '@/db/schema';
import { eq } from 'drizzle-orm';

interface Params {
    params: Promise<{ id: string }>;
}

// PUT - Mark account as received
export async function PUT(request: Request, { params }: Params) {
    try {
        const { id } = await params;
        const body = await request.json();

        const [updated] = await db
            .update(contasReceber)
            .set({
                status: body.status || 'pago',
                dataRecebimento: body.dataRecebimento || new Date().toISOString().split('T')[0],
            })
            .where(eq(contasReceber.id, parseInt(id)))
            .returning();

        if (!updated) {
            return NextResponse.json(
                { error: 'Conta não encontrada' },
                { status: 404 }
            );
        }

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Error updating account receivable:', error);
        return NextResponse.json(
            { error: 'Erro ao atualizar conta' },
            { status: 500 }
        );
    }
}

// DELETE - Delete account receivable
export async function DELETE(request: Request, { params }: Params) {
    try {
        const { id } = await params;

        const [deleted] = await db
            .delete(contasReceber)
            .where(eq(contasReceber.id, parseInt(id)))
            .returning();

        if (!deleted) {
            return NextResponse.json(
                { error: 'Conta não encontrada' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting account receivable:', error);
        return NextResponse.json(
            { error: 'Erro ao deletar conta' },
            { status: 500 }
        );
    }
}
