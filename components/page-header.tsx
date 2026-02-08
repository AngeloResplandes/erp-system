import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface PageHeaderProps {
    /** Título da página */
    title: string;
    /** Ícone do lucide-react */
    icon?: LucideIcon;
    /** Descrição abaixo do título */
    description?: string;
    /** Ação no canto direito (ex: botão "Novo") */
    action?: ReactNode;
}

/**
 * Header padrão para páginas do dashboard
 */
export function PageHeader({ title, icon: Icon, description, action }: PageHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
                    {Icon && <Icon className="h-6 w-6 sm:h-8 sm:w-8" />}
                    {title}
                </h1>
                {description && (
                    <p className="text-muted-foreground">{description}</p>
                )}
            </div>
            {action}
        </div>
    );
}
