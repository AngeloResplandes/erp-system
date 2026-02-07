import { NextResponse } from 'next/server';
import { db } from '@/db';
import { contasPagar, contasReceber } from '@/db/schema';
import { eq, desc, and, gte, lte, sql } from 'drizzle-orm';
import { contaPagarSchema, contaReceberSchema } from '@/lib/validations';

// GET - List all accounts payable
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const offset = (page - 1) * limit;

        const data = await db.query.contasPagar.findMany({
            with: { fornecedor: true },
            orderBy: desc(contasPagar.dataVencimento),
            limit,
            offset,
        });

        const total = await db.$count(contasPagar);

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
        console.error('Error fetching accounts payable:', error);
        return NextResponse.json(
            { error: 'Erro ao buscar contas a pagar' },
            { status: 500 }
        );
    }
}

// POST - Create new account payable
export async function POST(request: Request) {
    try {
        const body = await request.json();

        const result = contaPagarSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json(
                { error: 'Dados inválidos', details: result.error.flatten() },
                { status: 400 }
            );
        }

        const [newAccount] = await db
            .insert(contasPagar)
            .values({
                descricao: result.data.descricao,
                valor: result.data.valor.toString(),
                dataVencimento: result.data.dataVencimento,
                fornecedorId: result.data.fornecedorId || null,
                categoria: result.data.categoria || null,
            })
            .returning();

        return NextResponse.json(newAccount, { status: 201 });
    } catch (error) {
        console.error('Error creating account payable:', error);
        return NextResponse.json(
            { error: 'Erro ao criar conta a pagar' },
            { status: 500 }
        );
    }
}
