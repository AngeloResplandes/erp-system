'use client';

import { ReactNode, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface ConfirmDialogProps {
    /** Se o modal está aberto */
    open: boolean;
    /** Callback quando muda estado do modal */
    onOpenChange: (open: boolean) => void;
    /** Título do modal */
    title?: string;
    /** Mensagem de confirmação */
    message?: string;
    /** Texto do botão de confirmar */
    confirmText?: string;
    /** Texto do botão de cancelar */
    cancelText?: string;
    /** Variante do botão de confirmar */
    variant?: 'default' | 'destructive';
    /** Callback quando confirma */
    onConfirm: () => void | Promise<void>;
    /** Se está carregando */
    isLoading?: boolean;
}

/**
 * Dialog de confirmação para ações destrutivas
 */
export function ConfirmDialog({
    open,
    onOpenChange,
    title = 'Confirmar ação',
    message = 'Tem certeza que deseja continuar?',
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    variant = 'destructive',
    onConfirm,
    isLoading = false,
}: ConfirmDialogProps) {
    const handleConfirm = async () => {
        await onConfirm();
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{message}</DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isLoading}
                    >
                        {cancelText}
                    </Button>
                    <Button
                        variant={variant}
                        onClick={handleConfirm}
                        disabled={isLoading}
                    >
                        {confirmText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

/**
 * Hook para facilitar uso do ConfirmDialog
 */
export function useConfirmDialog() {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [pendingAction, setPendingAction] = useState<(() => void | Promise<void>) | null>(null);

    const confirm = (action: () => void | Promise<void>) => {
        setPendingAction(() => action);
        setIsOpen(true);
    };

    const handleConfirm = async () => {
        if (pendingAction) {
            setIsLoading(true);
            try {
                await pendingAction();
            } finally {
                setIsLoading(false);
                setIsOpen(false);
                setPendingAction(null);
            }
        }
    };

    return {
        isOpen,
        isLoading,
        setIsOpen,
        confirm,
        handleConfirm,
    };
}
