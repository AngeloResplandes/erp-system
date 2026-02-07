'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarTrigger,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    LayoutDashboard,
    Users,
    Package,
    ShoppingCart,
    DollarSign,
    BarChart3,
    Settings,
    LogOut,
    ChevronUp,
    Building2,
    Truck,
} from 'lucide-react';

const menuItems = [
    {
        title: 'Principal',
        items: [
            { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
        ],
    },
    {
        title: 'Cadastros',
        items: [
            { title: 'Clientes', url: '/dashboard/clientes', icon: Users },
            { title: 'Produtos', url: '/dashboard/produtos', icon: Package },
            { title: 'Fornecedores', url: '/dashboard/fornecedores', icon: Truck },
        ],
    },
    {
        title: 'Operações',
        items: [
            { title: 'Vendas', url: '/dashboard/vendas', icon: ShoppingCart },
            { title: 'Financeiro', url: '/dashboard/financeiro', icon: DollarSign },
        ],
    },
    {
        title: 'Análise',
        items: [
            { title: 'Relatórios', url: '/dashboard/relatorios', icon: BarChart3 },
        ],
    },
    {
        title: 'Sistema',
        items: [
            { title: 'Configurações', url: '/dashboard/configuracoes', icon: Settings },
        ],
    },
];

function AppSidebarContent() {
    const pathname = usePathname();
    const { user, logout } = useAuth();

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <Sidebar>
            <SidebarHeader className="border-b border-sidebar-border">
                <div className="flex items-center gap-2 px-4 py-3">
                    <Building2 className="h-8 w-8 text-primary" />
                    <div className="flex flex-col">
                        <span className="font-bold text-lg">ERP System</span>
                        <span className="text-xs text-muted-foreground">Gestão Empresarial</span>
                    </div>
                </div>
            </SidebarHeader>

            <SidebarContent className="gap-0">
                {menuItems.map((group) => (
                    <SidebarGroup key={group.title} className="py-1 gap-0">
                        <SidebarGroupLabel className="h-6 text-xs">{group.title}</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu className="gap-0">
                                {group.items.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={
                                                item.url === '/dashboard'
                                                    ? pathname === '/dashboard'
                                                    : pathname === item.url || pathname.startsWith(item.url + '/')
                                            }
                                            className="h-8"
                                        >
                                            <Link href={item.url}>
                                                <item.icon className="h-4 w-4" />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>

            <SidebarFooter className="border-t border-sidebar-border">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton className="w-full">
                                    <Avatar className="h-6 w-6">
                                        <AvatarFallback className="text-xs">
                                            {user ? getInitials(user.nome) : 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col items-start text-left">
                                        <span className="text-sm font-medium">{user?.nome || 'Usuário'}</span>
                                        <span className="text-xs text-muted-foreground capitalize">
                                            {user?.role || 'vendedor'}
                                        </span>
                                    </div>
                                    <ChevronUp className="ml-auto h-4 w-4" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent side="top" className="w-56">
                                <DropdownMenuItem asChild>
                                    <Link href="/dashboard/configuracoes">
                                        <Settings className="mr-2 h-4 w-4" />
                                        Configurações
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={logout} className="text-destructive">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Sair
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}

export function AppSidebar({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <AppSidebarContent />
            <main className="flex-1 flex flex-col min-h-screen">
                <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:px-6">
                    <SidebarTrigger />
                    <div className="ml-auto text-sm font-semibold text-muted-foreground">
                        Empresa Demonstração LTDA
                    </div>
                </header>
                <div className="flex-1 p-4 lg:p-6">
                    {children}
                </div>
            </main>
        </SidebarProvider>
    );
}
