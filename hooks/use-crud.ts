'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface UseCrudOptions<T> {
    /** Endpoint base da API (ex: '/api/clientes') */
    endpoint: string;
    /** Chave para o React Query (ex: 'clientes') */
    queryKey: string;
    /** Nome da entidade para mensagens de toast (ex: 'Cliente') */
    entityName: string;
    /** Query keys adicionais a invalidar após mutações */
    relatedQueryKeys?: string[];
}

interface UseCrudReturn<T, TFormData> {
    /** Dados retornados da API */
    data: { data: T[]; pagination: { page: number; limit: number; total: number; totalPages: number } } | undefined;
    /** Indica se está carregando */
    isLoading: boolean;
    /** Mutation para criar novo item */
    createMutation: ReturnType<typeof useMutation<T, Error, TFormData>>;
    /** Mutation para atualizar item */
    updateMutation: ReturnType<typeof useMutation<T, Error, { id: number; data: TFormData }>>;
    /** Mutation para deletar item */
    deleteMutation: ReturnType<typeof useMutation<unknown, Error, number>>;
    /** Indica se alguma mutation está em andamento */
    isSubmitting: boolean;
}

/**
 * Hook genérico para operações CRUD com React Query
 * 
 * @example
 * ```tsx
 * const { data, isLoading, createMutation, updateMutation, deleteMutation } = useCrud<Cliente, ClienteFormData>({
 *   endpoint: '/api/clientes',
 *   queryKey: 'clientes',
 *   entityName: 'Cliente'
 * });
 * ```
 */
export function useCrud<T, TFormData = Record<string, unknown>>({
    endpoint,
    queryKey,
    entityName,
    relatedQueryKeys = [],
}: UseCrudOptions<T>): UseCrudReturn<T, TFormData> {
    const queryClient = useQueryClient();

    // Query principal para listar dados
    const { data, isLoading } = useQuery({
        queryKey: [queryKey],
        queryFn: async () => {
            const res = await fetch(endpoint);
            if (!res.ok) throw new Error(`Erro ao buscar ${entityName.toLowerCase()}s`);
            return res.json();
        },
    });

    // Função auxiliar para invalidar queries relacionadas
    const invalidateRelated = () => {
        queryClient.invalidateQueries({ queryKey: [queryKey] });
        relatedQueryKeys.forEach((key) => {
            queryClient.invalidateQueries({ queryKey: [key] });
        });
    };

    // Mutation: Criar
    const createMutation = useMutation<T, Error, TFormData>({
        mutationFn: async (formData) => {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || `Erro ao criar ${entityName.toLowerCase()}`);
            }
            return res.json();
        },
        onSuccess: () => {
            invalidateRelated();
            toast.success(`${entityName} criado(a) com sucesso!`);
        },
        onError: (error) => {
            toast.error(error.message || `Erro ao criar ${entityName.toLowerCase()}`);
        },
    });

    // Mutation: Atualizar
    const updateMutation = useMutation<T, Error, { id: number; data: TFormData }>({
        mutationFn: async ({ id, data: formData }) => {
            const res = await fetch(`${endpoint}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || `Erro ao atualizar ${entityName.toLowerCase()}`);
            }
            return res.json();
        },
        onSuccess: () => {
            invalidateRelated();
            toast.success(`${entityName} atualizado(a) com sucesso!`);
        },
        onError: (error) => {
            toast.error(error.message || `Erro ao atualizar ${entityName.toLowerCase()}`);
        },
    });

    // Mutation: Deletar
    const deleteMutation = useMutation<unknown, Error, number>({
        mutationFn: async (id) => {
            const res = await fetch(`${endpoint}/${id}`, { method: 'DELETE' });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || `Erro ao remover ${entityName.toLowerCase()}`);
            }
            return res.json();
        },
        onSuccess: () => {
            invalidateRelated();
            toast.success(`${entityName} removido(a) com sucesso!`);
        },
        onError: (error) => {
            toast.error(error.message || `Erro ao remover ${entityName.toLowerCase()}`);
        },
    });

    const isSubmitting = createMutation.isPending || updateMutation.isPending;

    return {
        data,
        isLoading,
        createMutation,
        updateMutation,
        deleteMutation,
        isSubmitting,
    };
}

interface UseSearchCrudOptions<T> extends UseCrudOptions<T> {
    /** Termo de busca atual */
    search?: string;
    /** Limite de itens por página */
    limit?: number;
}

/**
 * Hook CRUD com suporte a busca
 */
export function useSearchCrud<T, TFormData = Record<string, unknown>>({
    endpoint,
    queryKey,
    entityName,
    relatedQueryKeys = [],
    search = '',
    limit = 10,
}: UseSearchCrudOptions<T>) {
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: [queryKey, search],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (search) params.set('search', search);
            params.set('limit', limit.toString());
            const res = await fetch(`${endpoint}?${params.toString()}`);
            if (!res.ok) throw new Error(`Erro ao buscar ${entityName.toLowerCase()}s`);
            return res.json();
        },
    });

    const invalidateRelated = () => {
        queryClient.invalidateQueries({ queryKey: [queryKey] });
        relatedQueryKeys.forEach((key) => {
            queryClient.invalidateQueries({ queryKey: [key] });
        });
    };

    const createMutation = useMutation<T, Error, TFormData>({
        mutationFn: async (formData) => {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || `Erro ao criar ${entityName.toLowerCase()}`);
            }
            return res.json();
        },
        onSuccess: () => {
            invalidateRelated();
            toast.success(`${entityName} criado(a) com sucesso!`);
        },
        onError: (error) => {
            toast.error(error.message || `Erro ao criar ${entityName.toLowerCase()}`);
        },
    });

    const updateMutation = useMutation<T, Error, { id: number; data: TFormData }>({
        mutationFn: async ({ id, data: formData }) => {
            const res = await fetch(`${endpoint}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || `Erro ao atualizar ${entityName.toLowerCase()}`);
            }
            return res.json();
        },
        onSuccess: () => {
            invalidateRelated();
            toast.success(`${entityName} atualizado(a) com sucesso!`);
        },
        onError: (error) => {
            toast.error(error.message || `Erro ao atualizar ${entityName.toLowerCase()}`);
        },
    });

    const deleteMutation = useMutation<unknown, Error, number>({
        mutationFn: async (id) => {
            const res = await fetch(`${endpoint}/${id}`, { method: 'DELETE' });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || `Erro ao remover ${entityName.toLowerCase()}`);
            }
            return res.json();
        },
        onSuccess: () => {
            invalidateRelated();
            toast.success(`${entityName} removido(a) com sucesso!`);
        },
        onError: (error) => {
            toast.error(error.message || `Erro ao remover ${entityName.toLowerCase()}`);
        },
    });

    const isSubmitting = createMutation.isPending || updateMutation.isPending;

    return {
        data,
        isLoading,
        createMutation,
        updateMutation,
        deleteMutation,
        isSubmitting,
    };
}
