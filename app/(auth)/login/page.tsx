'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const result = await login(email, password);

        if (!result.success) {
            toast.error(result.error || 'Erro ao fazer login');
        }

        setIsLoading(false);
    };

    return (
        <Card className="w-full max-w-md">
            <CardHeader className="space-y-1 text-center">
                <div className="flex justify-center mb-4">
                    <div className="flex items-center gap-2">
                        <Building2 className="h-10 w-10 text-primary" />
                        <span className="font-bold text-2xl">ERP System</span>
                    </div>
                </div>
                <CardTitle className="text-2xl">Bem-vindo de volta</CardTitle>
                <CardDescription>
                    Entre com suas credenciais para acessar o sistema
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="seu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Senha</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4 pt-6">
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Entrar
                    </Button>
                    <p className="text-sm text-muted-foreground">
                        Não tem uma conta?{' '}
                        <Link href="/register" className="text-primary hover:underline">
                            Registre-se
                        </Link>
                    </p>
                </CardFooter>
            </form>
        </Card>
    );
}
