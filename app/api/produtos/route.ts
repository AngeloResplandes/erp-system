import { NextResponse } from 'next/server';
import { db } from '@/db';
import { produtos, categorias } from '@/db/schema';
import { desc, ilike } from 'drizzle-orm';
import { produtoSchema } from '@/lib/validations';

// GET - List all products with optional search
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');
        const categoriaId = searchParams.get('categoriaId');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const offset = (page - 1) * limit;

        const data = await db.query.produtos.findMany({
            where: search ? ilike(produtos.nome, `%${search}%`) : undefined,
            with: { categoria: true },
            orderBy: desc(produtos.criadoEm),
            limit,
            offset,
        });

        const total = await db.$count(produtos);

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
        console.error('Error fetching products:', error);
        return NextResponse.json(
            { error: 'Erro ao buscar produtos' },
            { status: 500 }
        );
    }
}

// POST - Create new product
export async function POST(request: Request) {
    try {
        const body = await request.json();

        const result = produtoSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json(
                { error: 'Dados inválidos', details: result.error.flatten() },
                { status: 400 }
            );
        }

        const [newProduct] = await db.insert(produtos).values(result.data).returning();

        return NextResponse.json(newProduct, { status: 201 });
    } catch (error) {
        console.error('Error creating product:', error);
        return NextResponse.json(
            { error: 'Erro ao criar produto' },
            { status: 500 }
        );
    }
}
