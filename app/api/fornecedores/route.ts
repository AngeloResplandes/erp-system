import { NextResponse } from 'next/server';
import { db } from '@/db';
import { fornecedores } from '@/db/schema';
import { eq, desc, like, or } from 'drizzle-orm';
import { fornecedorSchema } from '@/lib/validations';

// GET - List all suppliers
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const offset = (page - 1) * limit;

        const data = await db.query.fornecedores.findMany({
            orderBy: desc(fornecedores.criadoEm),
            limit,
            offset,
        });

        const total = await db.$count(fornecedores);

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
        console.error('Error fetching suppliers:', error);
        return NextResponse.json(
            { error: 'Erro ao buscar fornecedores' },
            { status: 500 }
        );
    }
}

// POST - Create new supplier
export async function POST(request: Request) {
    try {
        const body = await request.json();

        const result = fornecedorSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json(
                { error: 'Dados inválidos', details: result.error.flatten() },
                { status: 400 }
            );
        }

        const [newSupplier] = await db.insert(fornecedores).values(result.data).returning();

        return NextResponse.json(newSupplier, { status: 201 });
    } catch (error) {
        console.error('Error creating supplier:', error);
        return NextResponse.json(
            { error: 'Erro ao criar fornecedor' },
            { status: 500 }
        );
    }
}
