'use client';

import { useState, useCallback } from 'react';

interface UseFormModalOptions<TFormData> {
    /** Estado inicial do formulário */
    initialFormData: TFormData;
}

interface UseFormModalReturn<T, TFormData> {
    /** Se o modal está aberto */
    isOpen: boolean;
    /** Controla abertura do modal */
    setIsOpen: (open: boolean) => void;
    /** Item sendo editado (null = novo) */
    editingItem: T | null;
    /** Dados do formulário */
    formData: TFormData;
    /** Atualiza dados do formulário */
    setFormData: React.Dispatch<React.SetStateAction<TFormData>>;
    /** Reseta formulário para estado inicial */
    resetForm: () => void;
    /** Abre modal para edição de um item */
    handleEdit: (item: T, mapToFormData: (item: T) => TFormData) => void;
    /** Handler para quando o modal fecha */
    handleOpenChange: (open: boolean) => void;
}

/**
 * Hook para gerenciar estado de modal de formulário CRUD
 * 
 * @example
 * ```tsx
 * const { isOpen, formData, setFormData, editingItem, handleEdit, handleOpenChange, resetForm } = useFormModal<Cliente, ClienteFormData>({
 *   initialFormData: { nome: '', email: '', telefone: '' }
 * });
 * ```
 */
export function useFormModal<T, TFormData>({
    initialFormData,
}: UseFormModalOptions<TFormData>): UseFormModalReturn<T, TFormData> {
    const [isOpen, setIsOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<T | null>(null);
    const [formData, setFormData] = useState<TFormData>(initialFormData);

    const resetForm = useCallback(() => {
        setFormData(initialFormData);
        setEditingItem(null);
    }, [initialFormData]);

    const handleEdit = useCallback((item: T, mapToFormData: (item: T) => TFormData) => {
        setEditingItem(item);
        setFormData(mapToFormData(item));
        setIsOpen(true);
    }, []);

    const handleOpenChange = useCallback((open: boolean) => {
        setIsOpen(open);
        if (!open) {
            resetForm();
        }
    }, [resetForm]);

    return {
        isOpen,
        setIsOpen,
        editingItem,
        formData,
        setFormData,
        resetForm,
        handleEdit,
        handleOpenChange,
    };
}
