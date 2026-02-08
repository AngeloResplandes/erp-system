'use client';

import { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

interface FormModalProps {
    /** Se o modal está aberto */
    isOpen: boolean;
    /** Callback quando muda estado do modal */
    onOpenChange: (open: boolean) => void;
    /** Título do modal */
    title: string;
    /** Descrição do modal */
    description?: string;
    /** Se está editando (muda texto do botão) */
    isEditing?: boolean;
    /** Se está submetendo (mostra spinner) */
    isSubmitting?: boolean;
    /** Callback de submit */
    onSubmit: (e: React.FormEvent) => void;
    /** Trigger do dialog (ex: botão "Novo") */
    trigger?: ReactNode;
    /** Conteúdo do formulário */
    children: ReactNode;
    /** Largura máxima do modal */
    maxWidth?: string;
}

/**
 * Modal genérico para formulários CRUD
 */
export function FormModal({
    isOpen,
    onOpenChange,
    title,
    description,
    isEditing = false,
    isSubmitting = false,
    onSubmit,
    trigger,
    children,
    maxWidth = 'sm:max-w-[600px]',
}: FormModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent className={maxWidth}>
                <form onSubmit={onSubmit}>
                    <DialogHeader>
                        <DialogTitle>{title}</DialogTitle>
                        {description && <DialogDescription>{description}</DialogDescription>}
                    </DialogHeader>
                    <div className="grid gap-4 py-4">{children}</div>
                    <DialogFooter>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isEditing ? 'Salvar' : 'Criar'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
