import { Metadata } from 'next';
import ProdutosClient from './produtos-client';

export const metadata: Metadata = {
    title: 'Produtos',
};

export default function ProdutosPage() {
    return <ProdutosClient />;
}
