import { Metadata } from 'next';
import FornecedoresClient from './fornecedores-client';

export const metadata: Metadata = {
    title: 'Fornecedores',
};

export default function FornecedoresPage() {
    return <FornecedoresClient />;
}
