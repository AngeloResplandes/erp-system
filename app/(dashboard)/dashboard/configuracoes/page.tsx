'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Settings, User, Building2, Database, Moon, Sun } from 'lucide-react';
import { toast } from 'sonner';

export default function ConfiguracoesPage() {
    const { user } = useAuth();
    const [darkMode, setDarkMode] = useState(false);

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
        document.documentElement.classList.toggle('dark');
        toast.success(darkMode ? 'Modo claro ativado' : 'Modo escuro ativado');
    };

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
                            <Input value={user?.nome || ''} disabled />
                        </div>
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input value={user?.email || ''} disabled />
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
                            <Input placeholder="Sua Empresa LTDA" />
                        </div>
                        <div className="space-y-2">
                            <Label>CNPJ</Label>
                            <Input placeholder="00.000.000/0000-00" />
                        </div>
                        <div className="space-y-2">
                            <Label>Telefone</Label>
                            <Input placeholder="(00) 0000-0000" />
                        </div>
                        <Separator />
                        <Button className="w-full" onClick={() => toast.success('Configurações salvas!')}>
                            Salvar Alterações
                        </Button>
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
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Status</span>
                                <Badge className="bg-yellow-500">Aguardando configuração</Badge>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Tipo</span>
                                <span>PostgreSQL</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">ORM</span>
                                <span>Drizzle ORM</span>
                            </div>
                        </div>
                        <Separator />
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">
                                Para usar o ERP completamente, configure as variáveis de ambiente:
                            </p>
                            <code className="block p-2 bg-muted rounded text-xs">
                                DATABASE_URL="postgresql://..."
                            </code>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
