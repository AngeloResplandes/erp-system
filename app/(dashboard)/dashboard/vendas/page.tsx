import { Metadata } from 'next';
import VendasClient from './vendas-client';

export const metadata: Metadata = {
    title: 'Vendas',
};

export default function VendasPage() {
    return <VendasClient />;
}
