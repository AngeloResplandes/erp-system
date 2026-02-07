'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Settings, User, Building2, Database, Moon, Sun, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

type DbStatus = 'loading' | 'connected' | 'error';

export default function ConfiguracoesPage() {
    const { user, isLoading } = useAuth();
    const [darkMode, setDarkMode] = useState(false);
    const [dbStatus, setDbStatus] = useState<DbStatus>('loading');
    const [isCheckingDb, setIsCheckingDb] = useState(false);

    const checkDatabaseConnection = async () => {
        setIsCheckingDb(true);
        try {
            const response = await fetch('/api/health');
            const data = await response.json();
            setDbStatus(data.status === 'connected' ? 'connected' : 'error');
        } catch {
            setDbStatus('error');
        } finally {
            setIsCheckingDb(false);
        }
    };

    useEffect(() => {
        checkDatabaseConnection();
    }, []);

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
        document.documentElement.classList.toggle('dark');
        toast.success(darkMode ? 'Modo claro ativado' : 'Modo escuro ativado');
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div>
                    <Skeleton className="h-8 w-48 mb-2" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                    <Skeleton className="h-[300px]" />
                    <Skeleton className="h-[300px]" />
                    <Skeleton className="h-[150px]" />
                    <Skeleton className="h-[200px]" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <Settings className="h-8 w-8" /> Configurações
                </h1>
                <p className="text-muted-foreground">
                    Gerencie as configurações do sistema
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* User Profile */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" /> Perfil do Usuário
                        </CardTitle>
                        <CardDescription>
                            Suas informações pessoais
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Nome</Label>
                            <Input value={user?.nome ?? ''} disabled />
                        </div>
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input value={user?.email ?? ''} disabled />
                        </div>
                        <div className="space-y-2">
                            <Label>Função</Label>
                            <div>
                                <Badge variant="outline" className="capitalize">
                                    {user?.role || 'vendedor'}
                                </Badge>
                            </div>
                        </div>
                        <Separator />
                        <Button variant="outline" className="w-full" disabled>
                            Alterar Senha (em breve)
                        </Button>
                    </CardContent>
                </Card>

                {/* Company Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building2 className="h-5 w-5" /> Dados da Empresa
                        </CardTitle>
                        <CardDescription>
                            Configurações da sua empresa
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Nome da Empresa</Label>
                            <Input value="Empresa Demonstração LTDA" disabled />
                        </div>
                        <div className="space-y-2">
                            <Label>CNPJ</Label>
                            <Input value="12.345.678/0001-90" disabled />
                        </div>
                        <div className="space-y-2">
                            <Label>Telefone</Label>
                            <Input value="(11) 3456-7890" disabled />
                        </div>
                        <Separator />
                        <p className="text-xs text-muted-foreground text-center">
                            Configurações da empresa são gerenciadas pelo administrador do sistema
                        </p>
                    </CardContent>
                </Card>

                {/* Appearance */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            {darkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                            Aparência
                        </CardTitle>
                        <CardDescription>
                            Personalize a interface do sistema
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="font-medium">Modo Escuro</div>
                                <div className="text-sm text-muted-foreground">
                                    Ative o tema escuro para reduzir o cansaço visual
                                </div>
                            </div>
                            <Button
                                variant={darkMode ? 'default' : 'outline'}
                                size="icon"
                                onClick={toggleDarkMode}
                            >
                                {darkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Database Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Database className="h-5 w-5" /> Banco de Dados
                        </CardTitle>
                        <CardDescription>
                            Informações sobre o armazenamento
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-3 text-sm">
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Status</span>
                                <div className="flex items-center gap-2">
                                    {dbStatus === 'loading' && (
                                        <Badge variant="outline">Verificando...</Badge>
                                    )}
                                    {dbStatus === 'connected' && (
                                        <Badge className="bg-green-500">Conectado</Badge>
                                    )}
                                    {dbStatus === 'error' && (
                                        <Badge className="bg-red-500">Erro de conexão</Badge>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6"
                                        onClick={checkDatabaseConnection}
                                        disabled={isCheckingDb}
                                    >
                                        <RefreshCw className={`h-3 w-3 ${isCheckingDb ? 'animate-spin' : ''}`} />
                                    </Button>
                                </div>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Tipo</span>
                                <span>PostgreSQL</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">ORM</span>
                                <span>Drizzle ORM</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Host</span>
                                <span>localhost:5432</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
