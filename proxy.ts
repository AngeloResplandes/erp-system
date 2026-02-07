import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'dev-secret-key'
);

// Routes that don't require authentication
const publicRoutes = ['/', '/login', '/register'];

// API routes that don't require authentication
const publicApiRoutes = ['/api/auth/login', '/api/auth/register', '/api/health', '/api/dashboard', '/api/relatorios'];

export default async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Allow public routes
    if (publicRoutes.includes(pathname)) {
        return NextResponse.next();
    }

    // Allow public API routes
    if (publicApiRoutes.some((route) => pathname.startsWith(route))) {
        return NextResponse.next();
    }

    // Allow static files and Next.js internals
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api/_next') ||
        pathname.includes('.') // static files
    ) {
        return NextResponse.next();
    }

    // Check for auth token
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
        // Redirect to login for dashboard routes
        if (pathname.startsWith('/api/')) {
            return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
        }
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Verify token
    try {
        await jwtVerify(token, JWT_SECRET);
        return NextResponse.next();
    } catch {
        // Invalid token - clear cookie and redirect
        const response = pathname.startsWith('/api/')
            ? NextResponse.json({ error: 'Token inválido' }, { status: 401 })
            : NextResponse.redirect(new URL('/login', request.url));

        response.cookies.delete('auth-token');
        return response;
    }
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
