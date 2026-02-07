import { NextResponse } from 'next/server';
import { db } from '@/db';
import { vendas, itensVenda, produtos, clientes, fornecedores } from '@/db/schema';
import { sql, eq, gte, lte, and, desc } from 'drizzle-orm';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const periodo = searchParams.get('periodo') || '6m';

        // Calcular data inicial baseada no período
        const hoje = new Date();
        let mesesAtras = 6;
        if (periodo === '3m') mesesAtras = 3;
        if (periodo === '12m') mesesAtras = 12;

        const dataInicial = new Date(hoje);
        dataInicial.setMonth(dataInicial.getMonth() - mesesAtras);
        dataInicial.setDate(1);
        dataInicial.setHours(0, 0, 0, 0);

        // Vendas mensais agrupadas por mês
        const vendasPorMes = await db
            .select({
                ano: sql<number>`EXTRACT(YEAR FROM ${vendas.dataVenda})`,
                mes: sql<number>`EXTRACT(MONTH FROM ${vendas.dataVenda})`,
                totalVendas: sql<number>`COUNT(*)`,
                receita: sql<string>`COALESCE(SUM(${vendas.total}), 0)`,
            })
            .from(vendas)
            .where(
                and(
                    eq(vendas.status, 'finalizada'),
                    gte(vendas.dataVenda, dataInicial)
                )
            )
            .groupBy(
                sql`EXTRACT(YEAR FROM ${vendas.dataVenda})`,
                sql`EXTRACT(MONTH FROM ${vendas.dataVenda})`
            )
            .orderBy(
                sql`EXTRACT(YEAR FROM ${vendas.dataVenda})`,
                sql`EXTRACT(MONTH FROM ${vendas.dataVenda})`
            );

        // Formatar vendas mensais
        const nomesMeses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        const vendasMensais = vendasPorMes.map(v => ({
            mes: nomesMeses[Number(v.mes) - 1],
            vendas: Number(v.totalVendas),
            receita: parseFloat(v.receita),
        }));

        // Produtos mais vendidos (top 5)
        const produtosMaisVendidos = await db
            .select({
                produtoId: itensVenda.produtoId,
                nome: produtos.nome,
                quantidade: sql<number>`SUM(${itensVenda.quantidade})`,
            })
            .from(itensVenda)
            .innerJoin(produtos, eq(itensVenda.produtoId, produtos.id))
            .innerJoin(vendas, eq(itensVenda.vendaId, vendas.id))
            .where(
                and(
                    eq(vendas.status, 'finalizada'),
                    gte(vendas.dataVenda, dataInicial)
                )
            )
            .groupBy(itensVenda.produtoId, produtos.nome)
            .orderBy(sql`SUM(${itensVenda.quantidade}) DESC`)
            .limit(5);

        // Formas de pagamento
        const formasPagamento = await db
            .select({
                formaPagamento: vendas.formaPagamento,
                count: sql<number>`COUNT(*)`,
                total: sql<string>`COALESCE(SUM(${vendas.total}), 0)`,
            })
            .from(vendas)
            .where(
                and(
                    eq(vendas.status, 'finalizada'),
                    gte(vendas.dataVenda, dataInicial)
                )
            )
            .groupBy(vendas.formaPagamento);

        // Cores para formas de pagamento
        const coresPagamento: Record<string, string> = {
            pix: '#22c55e',
            cartao_credito: '#3b82f6',
            cartao_debito: '#8b5cf6',
            dinheiro: '#f59e0b',
            boleto: '#ef4444',
        };

        const nomesPagamento: Record<string, string> = {
            pix: 'PIX',
            cartao_credito: 'Cartão Crédito',
            cartao_debito: 'Cartão Débito',
            dinheiro: 'Dinheiro',
            boleto: 'Boleto',
        };

        const formasPagamentoData = formasPagamento.map(fp => ({
            name: nomesPagamento[fp.formaPagamento || ''] || fp.formaPagamento || 'Outros',
            value: Number(fp.count),
            total: parseFloat(fp.total),
            color: coresPagamento[fp.formaPagamento || ''] || '#6b7280',
        }));

        // Totais gerais
        const totalClientesResult = await db
            .select({ count: sql<number>`COUNT(*)` })
            .from(clientes)
            .where(eq(clientes.ativo, true));
        const totalClientes = Number(totalClientesResult[0]?.count) || 0;

        const totalProdutosResult = await db
            .select({ count: sql<number>`COUNT(*)` })
            .from(produtos)
            .where(eq(produtos.ativo, true));
        const totalProdutos = Number(totalProdutosResult[0]?.count) || 0;

        const totalFornecedoresResult = await db
            .select({ count: sql<number>`COUNT(*)` })
            .from(fornecedores)
            .where(eq(fornecedores.ativo, true));
        const totalFornecedores = Number(totalFornecedoresResult[0]?.count) || 0;

        const totalVendasResult = await db
            .select({
                count: sql<number>`COUNT(*)`,
                total: sql<string>`COALESCE(SUM(${vendas.total}), 0)`
            })
            .from(vendas)
            .where(eq(vendas.status, 'finalizada'));
        const totalVendas = Number(totalVendasResult[0]?.count) || 0;
        const receitaTotal = parseFloat(totalVendasResult[0]?.total || '0');

        // Vendas no período selecionado
        const vendasPeriodoResult = await db
            .select({
                count: sql<number>`COUNT(*)`,
                total: sql<string>`COALESCE(SUM(${vendas.total}), 0)`
            })
            .from(vendas)
            .where(
                and(
                    eq(vendas.status, 'finalizada'),
                    gte(vendas.dataVenda, dataInicial)
                )
            );
        const vendasPeriodo = Number(vendasPeriodoResult[0]?.count) || 0;
        const receitaPeriodo = parseFloat(vendasPeriodoResult[0]?.total || '0');

        return NextResponse.json({
            vendasMensais,
            produtosMaisVendidos: produtosMaisVendidos.map(p => ({
                nome: p.nome,
                quantidade: Number(p.quantidade),
            })),
            formasPagamento: formasPagamentoData,
            resumo: {
                totalClientes,
                totalProdutos,
                totalFornecedores,
                totalVendas,
                receitaTotal,
                vendasPeriodo,
                receitaPeriodo,
            },
        });
    } catch (error) {
        console.error('Erro ao buscar dados de relatórios:', error);
        return NextResponse.json(
            { error: 'Erro ao buscar dados de relatórios' },
            { status: 500 }
        );
    }
}
