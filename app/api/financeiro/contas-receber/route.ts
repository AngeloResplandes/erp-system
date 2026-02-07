import { NextResponse } from 'next/server';
import { db } from '@/db';
import { contasReceber } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { contaReceberSchema } from '@/lib/validations';

// GET - List all accounts receivable
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const offset = (page - 1) * limit;

        const data = await db.query.contasReceber.findMany({
            with: {
                cliente: true,
                venda: true,
            },
            orderBy: desc(contasReceber.dataVencimento),
            limit,
            offset,
        });

        const total = await db.$count(contasReceber);

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
        console.error('Error fetching accounts receivable:', error);
        return NextResponse.json(
            { error: 'Erro ao buscar contas a receber' },
            { status: 500 }
        );
    }
}

// POST - Create new account receivable
export async function POST(request: Request) {
    try {
        const body = await request.json();

        const result = contaReceberSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json(
                { error: 'Dados inválidos', details: result.error.flatten() },
                { status: 400 }
            );
        }

        const [newAccount] = await db
            .insert(contasReceber)
            .values({
                clienteId: result.data.clienteId || null,
                vendaId: result.data.vendaId || null,
                valor: result.data.valor.toString(),
                dataVencimento: result.data.dataVencimento,
            })
            .returning();

        return NextResponse.json(newAccount, { status: 201 });
    } catch (error) {
        console.error('Error creating account receivable:', error);
        return NextResponse.json(
            { error: 'Erro ao criar conta a receber' },
            { status: 500 }
        );
    }
}
