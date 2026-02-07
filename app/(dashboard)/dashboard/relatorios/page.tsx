import { Metadata } from 'next';
import RelatoriosClient from './relatorios-client';

export const metadata: Metadata = {
    title: 'Relatórios',
};

export default function RelatoriosPage() {
    return <RelatoriosClient />;
}
