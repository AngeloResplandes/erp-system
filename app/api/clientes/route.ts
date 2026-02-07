import { NextResponse } from 'next/server';
import { db } from '@/db';
import { clientes } from '@/db/schema';
import { eq, desc, ilike, or } from 'drizzle-orm';
import { clienteSchema } from '@/lib/validations';

// GET - List all clients with optional search
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const offset = (page - 1) * limit;

        const data = await db.query.clientes.findMany({
            orderBy: desc(clientes.criadoEm),
            limit,
            offset,
        });

        const total = await db.$count(clientes);

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
        console.error('Error fetching clients:', error);
        return NextResponse.json(
            { error: 'Erro ao buscar clientes' },
            { status: 500 }
        );
    }
}

// POST - Create new client
export async function POST(request: Request) {
    try {
        const body = await request.json();

        const result = clienteSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json(
                { error: 'Dados inválidos', details: result.error.flatten() },
                { status: 400 }
            );
        }

        const [newClient] = await db.insert(clientes).values(result.data).returning();

        return NextResponse.json(newClient, { status: 201 });
    } catch (error) {
        console.error('Error creating client:', error);
        return NextResponse.json(
            { error: 'Erro ao criar cliente' },
            { status: 500 }
        );
    }
}
