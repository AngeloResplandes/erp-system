import { NextResponse } from 'next/server';
import { db } from '@/db';
import { usuarios } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { verifyPassword, createToken, setSession } from '@/lib/auth';
import { loginSchema } from '@/lib/validations';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Validate input
        const result = loginSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json(
                { error: 'Dados inválidos', details: result.error.flatten() },
                { status: 400 }
            );
        }

        const { email, password } = result.data;

        // Find user
        const user = await db.query.usuarios.findFirst({
            where: eq(usuarios.email, email),
        });

        if (!user) {
            return NextResponse.json(
                { error: 'Email ou senha incorretos' },
                { status: 401 }
            );
        }

        if (!user.ativo) {
            return NextResponse.json(
                { error: 'Usuário inativo' },
                { status: 401 }
            );
        }

        // Verify password
        const isValid = await verifyPassword(password, user.senhaHash);
        if (!isValid) {
            return NextResponse.json(
                { error: 'Email ou senha incorretos' },
                { status: 401 }
            );
        }

        // Create token
        const token = await createToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        });

        // Set session cookie
        await setSession(token);

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                nome: user.nome,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}
