import { NextResponse } from 'next/server';
import { db } from '@/db';
import { usuarios } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { hashPassword, createToken, setSession } from '@/lib/auth';
import { registerSchema } from '@/lib/validations';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Validate input
        const result = registerSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json(
                { error: 'Dados inválidos', details: result.error.flatten() },
                { status: 400 }
            );
        }

        const { nome, email, password } = result.data;

        // Check if user exists
        const existingUser = await db.query.usuarios.findFirst({
            where: eq(usuarios.email, email),
        });

        if (existingUser) {
            return NextResponse.json(
                { error: 'Email já cadastrado' },
                { status: 400 }
            );
        }

        // Hash password
        const senhaHash = await hashPassword(password);

        // Create user
        const [newUser] = await db.insert(usuarios).values({
            nome,
            email,
            senhaHash,
            role: 'vendedor', // Default role
        }).returning();

        // Create token
        const token = await createToken({
            userId: newUser.id,
            email: newUser.email,
            role: newUser.role,
        });

        // Set session cookie
        await setSession(token);

        return NextResponse.json({
            success: true,
            user: {
                id: newUser.id,
                nome: newUser.nome,
                email: newUser.email,
                role: newUser.role,
            },
        });
    } catch (error) {
        console.error('Register error:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}
