import { NextResponse } from 'next/server';
import { db } from '@/db';
import { clientes, produtos, vendas, contasPagar, contasReceber, fornecedores, itensVenda } from '@/db/schema';
import { sql, eq, gte, lte, and, desc } from 'drizzle-orm';

export async function GET() {
    try {
        // Calcular datas antecipadamente (operações síncronas)
        const inicioMes = new Date();
        inicioMes.setDate(1);
        inicioMes.setHours(0, 0, 0, 0);

        const inicioMesAnterior = new Date(inicioMes);
        inicioMesAnterior.setMonth(inicioMesAnterior.getMonth() - 1);
        const fimMesAnterior = new Date(inicioMes);
        fimMesAnterior.setDate(0);

        const hoje = new Date();
        const em7Dias = new Date();
        em7Dias.setDate(hoje.getDate() + 7);
        const hojeStr = hoje.toISOString().split('T')[0];
        const em7DiasStr = em7Dias.toISOString().split('T')[0];

        // Todas as queries independentes em paralelo
        const [
            clientesResult,
            produtosResult,
            estoqueBaixoResult,
            fornecedoresResult,
            vendasMesResult,
            vendasMesAnteriorResult,
            vendasTotalResult,
            contasPagarResult,
            contasReceberResult,
            contasVencerResult,
            receberVencerResult,
            produtosMaisVendidos,
            vendasRecentesResult,
            vendasPorPagamento,
        ] = await Promise.all([
            // Total de clientes ativos
            db.select({ count: sql<number>`count(*)` })
                .from(clientes)
                .where(eq(clientes.ativo, true)),

            // Total de produtos ativos
            db.select({ count: sql<number>`count(*)` })
                .from(produtos)
                .where(eq(produtos.ativo, true)),

            // Produtos com estoque baixo
            db.select({ count: sql<number>`count(*)` })
                .from(produtos)
                .where(
                    and(
                        eq(produtos.ativo, true),
                        sql`${produtos.estoqueAtual} <= ${produtos.estoqueMinimo}`
                    )
                ),

            // Total de fornecedores ativos
            db.select({ count: sql<number>`count(*)` })
                .from(fornecedores)
                .where(eq(fornecedores.ativo, true)),

            // Vendas do mês atual
            db.select({
                total: sql<string>`COALESCE(SUM(${vendas.total}), 0)`,
                count: sql<number>`count(*)`
            })
                .from(vendas)
                .where(
                    and(
                        eq(vendas.status, 'finalizada'),
                        gte(vendas.dataVenda, inicioMes)
                    )
                ),

            // Vendas do mês anterior
            db.select({
                total: sql<string>`COALESCE(SUM(${vendas.total}), 0)`,
                count: sql<number>`count(*)`
            })
                .from(vendas)
                .where(
                    and(
                        eq(vendas.status, 'finalizada'),
                        gte(vendas.dataVenda, inicioMesAnterior),
                        lte(vendas.dataVenda, fimMesAnterior)
                    )
                ),

            // Total geral de vendas
            db.select({
                total: sql<string>`COALESCE(SUM(${vendas.total}), 0)`,
                count: sql<number>`count(*)`
            })
                .from(vendas)
                .where(eq(vendas.status, 'finalizada')),

            // Contas a pagar pendentes
            db.select({ total: sql<string>`COALESCE(SUM(${contasPagar.valor}), 0)` })
                .from(contasPagar)
                .where(eq(contasPagar.status, 'pendente')),

            // Contas a receber pendentes
            db.select({ total: sql<string>`COALESCE(SUM(${contasReceber.valor}), 0)` })
                .from(contasReceber)
                .where(eq(contasReceber.status, 'pendente')),

            // Contas a pagar nos próximos 7 dias
            db.select({
                count: sql<number>`count(*)`,
                total: sql<string>`COALESCE(SUM(${contasPagar.valor}), 0)`
            })
                .from(contasPagar)
                .where(
                    and(
                        eq(contasPagar.status, 'pendente'),
                        gte(contasPagar.dataVencimento, hojeStr),
                        lte(contasPagar.dataVencimento, em7DiasStr)
                    )
                ),

            // Contas a receber nos próximos 7 dias
            db.select({
                count: sql<number>`count(*)`,
                total: sql<string>`COALESCE(SUM(${contasReceber.valor}), 0)`
            })
                .from(contasReceber)
                .where(
                    and(
                        eq(contasReceber.status, 'pendente'),
                        gte(contasReceber.dataVencimento, hojeStr),
                        lte(contasReceber.dataVencimento, em7DiasStr)
                    )
                ),

            // Produtos mais vendidos (top 5)
            db.select({
                produtoId: itensVenda.produtoId,
                nome: produtos.nome,
                totalVendido: sql<number>`SUM(${itensVenda.quantidade})`,
                valorTotal: sql<string>`SUM(${itensVenda.subtotal})`,
            })
                .from(itensVenda)
                .innerJoin(produtos, eq(itensVenda.produtoId, produtos.id))
                .groupBy(itensVenda.produtoId, produtos.nome)
                .orderBy(sql`SUM(${itensVenda.quantidade}) DESC`)
                .limit(5),

            // Últimas 3 vendas com nome do cliente via JOIN (elimina N+1)
            db.select({
                id: vendas.id,
                clienteNome: clientes.nome,
                total: vendas.total,
                dataVenda: vendas.dataVenda,
                formaPagamento: vendas.formaPagamento,
            })
                .from(vendas)
                .leftJoin(clientes, eq(vendas.clienteId, clientes.id))
                .where(eq(vendas.status, 'finalizada'))
                .orderBy(desc(vendas.dataVenda))
                .limit(3),

            // Vendas por forma de pagamento
            db.select({
                formaPagamento: vendas.formaPagamento,
                count: sql<number>`count(*)`,
                total: sql<string>`COALESCE(SUM(${vendas.total}), 0)`,
            })
                .from(vendas)
                .where(eq(vendas.status, 'finalizada'))
                .groupBy(vendas.formaPagamento),
        ]);

        // Processar resultados
        const totalClientes = Number(clientesResult[0]?.count) || 0;
        const totalProdutos = Number(produtosResult[0]?.count) || 0;
        const produtosEstoqueBaixo = Number(estoqueBaixoResult[0]?.count) || 0;
        const totalFornecedores = Number(fornecedoresResult[0]?.count) || 0;

        const totalVendasMes = parseFloat(vendasMesResult[0]?.total || '0');
        const qtdVendasMes = Number(vendasMesResult[0]?.count) || 0;
        const totalVendasMesAnterior = parseFloat(vendasMesAnteriorResult[0]?.total || '0');
        const variacaoVendas = totalVendasMesAnterior > 0
            ? ((totalVendasMes - totalVendasMesAnterior) / totalVendasMesAnterior) * 100
            : 0;

        const totalVendasGeral = parseFloat(vendasTotalResult[0]?.total || '0');
        const qtdVendasTotal = Number(vendasTotalResult[0]?.count) || 0;
        const ticketMedio = qtdVendasTotal > 0 ? totalVendasGeral / qtdVendasTotal : 0;

        const totalContasPagar = parseFloat(contasPagarResult[0]?.total || '0');
        const totalContasReceber = parseFloat(contasReceberResult[0]?.total || '0');
        const saldo = totalContasReceber - totalContasPagar;

        const contasAVencer7Dias = Number(contasVencerResult[0]?.count) || 0;
        const valorContasAVencer7Dias = parseFloat(contasVencerResult[0]?.total || '0');
        const receberAVencer7Dias = Number(receberVencerResult[0]?.count) || 0;
        const valorReceberAVencer7Dias = parseFloat(receberVencerResult[0]?.total || '0');

        const vendasComClientes = vendasRecentesResult.map((venda) => ({
            ...venda,
            clienteNome: venda.clienteNome || 'Venda sem cliente',
        }));

        return NextResponse.json({
            stats: {
                clientes: { total: totalClientes },
                produtos: { total: totalProdutos, estoqueBaixo: produtosEstoqueBaixo },
                fornecedores: { total: totalFornecedores },
                vendasMes: {
                    total: totalVendasMes,
                    quantidade: qtdVendasMes,
                    variacao: variacaoVendas,
                    mesAnterior: totalVendasMesAnterior,
                },
                vendasGeral: {
                    total: totalVendasGeral,
                    quantidade: qtdVendasTotal,
                    ticketMedio,
                },
                financeiro: {
                    saldo,
                    contasPagar: totalContasPagar,
                    contasReceber: totalContasReceber,
                    contasAVencer7Dias,
                    valorContasAVencer7Dias,
                    receberAVencer7Dias,
                    valorReceberAVencer7Dias,
                },
            },
            vendasRecentes: vendasComClientes,
            produtosMaisVendidos,
            vendasPorPagamento,
        });
    } catch (error) {
        console.error('Erro ao buscar dados do dashboard:', error);
        return NextResponse.json(
            { error: 'Erro ao buscar dados do dashboard' },
            { status: 500 }
        );
    }
}
