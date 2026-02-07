import { NextResponse } from 'next/server';
import { db } from '@/db';
import { sql } from 'drizzle-orm';

export async function GET() {
    try {
        // Tenta executar uma query simples para verificar a conexão
        await db.execute(sql`SELECT 1`);

        return NextResponse.json({
            status: 'connected',
            message: 'Banco de dados conectado com sucesso',
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Database connection error:', error);

        return NextResponse.json({
            status: 'error',
            message: 'Erro ao conectar com o banco de dados',
            timestamp: new Date().toISOString(),
        }, { status: 500 });
    }
}
