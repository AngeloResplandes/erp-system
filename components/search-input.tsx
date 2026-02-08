'use client';

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface SearchInputProps {
    /** Valor atual do input */
    value: string;
    /** Callback quando o valor muda */
    onChange: (value: string) => void;
    /** Placeholder do input */
    placeholder?: string;
    /** Classes adicionais para o container */
    className?: string;
}

/**
 * Input de busca com ícone de lupa
 */
export function SearchInput({
    value,
    onChange,
    placeholder = 'Buscar...',
    className = '',
}: SearchInputProps) {
    return (
        <div className={`relative flex-1 max-w-sm ${className}`}>
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
                placeholder={placeholder}
                className="pl-8"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
}
