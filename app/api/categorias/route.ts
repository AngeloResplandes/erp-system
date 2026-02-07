import { NextResponse } from 'next/server';
import { db } from '@/db';
import { categorias } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { categoriaSchema } from '@/lib/validations';

// GET - List all categories
export async function GET() {
    try {
        const data = await db.query.categorias.findMany({
            orderBy: desc(categorias.criadoEm),
        });

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching categories:', error);
        return NextResponse.json(
            { error: 'Erro ao buscar categorias' },
            { status: 500 }
        );
    }
}

// POST - Create new category
export async function POST(request: Request) {
    try {
        const body = await request.json();

        const result = categoriaSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json(
                { error: 'Dados inválidos', details: result.error.flatten() },
                { status: 400 }
            );
        }

        const [newCategory] = await db.insert(categorias).values(result.data).returning();

        return NextResponse.json(newCategory, { status: 201 });
    } catch (error) {
        console.error('Error creating category:', error);
        return NextResponse.json(
            { error: 'Erro ao criar categoria' },
            { status: 500 }
        );
    }
}
