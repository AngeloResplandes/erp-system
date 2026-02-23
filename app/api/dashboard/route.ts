import { NextResponse } from 'next/server';
import { db } from '@/db';
import { clientes, produtos, vendas, contasPagar, contasReceber, fornecedores, itensVenda, categorias } from '@/db/schema';
import { sql, eq, gte, lte, and, desc } from 'drizzle-orm';

export async function GET() {
    try {
        // Total de clientes ativos
        const clientesResult = await db
            .select({ count: sql<number>`count(*)` })
            .from(clientes)
            .where(eq(clientes.ativo, true));
        const totalClientes = Number(clientesResult[0]?.count) || 0;

        // Total de produtos ativos e com estoque baixo
        const produtosResult = await db
            .select({ count: sql<number>`count(*)` })
            .from(produtos)
            .where(eq(produtos.ativo, true));
        const totalProdutos = Number(produtosResult[0]?.count) || 0;

        const estoqueBaixoResult = await db
            .select({ count: sql<number>`count(*)` })
            .from(produtos)
            .where(
                and(
                    eq(produtos.ativo, true),
                    sql`${produtos.estoqueAtual} <= ${produtos.estoqueMinimo}`
                )
            );
        const produtosEstoqueBaixo = Number(estoqueBaixoResult[0]?.count) || 0;

        // Total de fornecedores ativos
        const fornecedoresResult = await db
            .select({ count: sql<number>`count(*)` })
            .from(fornecedores)
            .where(eq(fornecedores.ativo, true));
        const totalFornecedores = Number(fornecedoresResult[0]?.count) || 0;

        // Vendas do mês atual
        const inicioMes = new Date();
        inicioMes.setDate(1);
        inicioMes.setHours(0, 0, 0, 0);

        const vendasMesResult = await db
            .select({
                total: sql<string>`COALESCE(SUM(${vendas.total}), 0)`,
                count: sql<number>`count(*)`
            })
            .from(vendas)
            .where(
                and(
                    eq(vendas.status, 'finalizada'),
                    gte(vendas.dataVenda, inicioMes)
                )
            );
        const totalVendasMes = parseFloat(vendasMesResult[0]?.total || '0');
        const qtdVendasMes = Number(vendasMesResult[0]?.count) || 0;

        // Vendas do mês anterior (para comparativo)
        const inicioMesAnterior = new Date(inicioMes);
        inicioMesAnterior.setMonth(inicioMesAnterior.getMonth() - 1);
        const fimMesAnterior = new Date(inicioMes);
        fimMesAnterior.setDate(0);

        const vendasMesAnteriorResult = await db
            .select({
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
            );
        const totalVendasMesAnterior = parseFloat(vendasMesAnteriorResult[0]?.total || '0');

        // Calcular variação percentual
        const variacaoVendas = totalVendasMesAnterior > 0
            ? ((totalVendasMes - totalVendasMesAnterior) / totalVendasMesAnterior) * 100
            : 0;

        // Total geral de vendas (histórico)
        const vendasTotalResult = await db
            .select({
                total: sql<string>`COALESCE(SUM(${vendas.total}), 0)`,
                count: sql<number>`count(*)`
            })
            .from(vendas)
            .where(eq(vendas.status, 'finalizada'));
        const totalVendasGeral = parseFloat(vendasTotalResult[0]?.total || '0');
        const qtdVendasTotal = Number(vendasTotalResult[0]?.count) || 0;

        // Contas a pagar pendentes
        const contasPagarResult = await db
            .select({ total: sql<string>`COALESCE(SUM(${contasPagar.valor}), 0)` })
            .from(contasPagar)
            .where(eq(contasPagar.status, 'pendente'));
        const totalContasPagar = parseFloat(contasPagarResult[0]?.total || '0');

        // Contas a receber pendentes
        const contasReceberResult = await db
            .select({ total: sql<string>`COALESCE(SUM(${contasReceber.valor}), 0)` })
            .from(contasReceber)
            .where(eq(contasReceber.status, 'pendente'));
        const totalContasReceber = parseFloat(contasReceberResult[0]?.total || '0');

        // Saldo (a receber - a pagar)
        const saldo = totalContasReceber - totalContasPagar;

        // Contas a vencer nos próximos 7 dias
        const hoje = new Date();
        const em7Dias = new Date();
        em7Dias.setDate(hoje.getDate() + 7);
        const hojeStr = hoje.toISOString().split('T')[0];
        const em7DiasStr = em7Dias.toISOString().split('T')[0];

        const contasVencerResult = await db
            .select({
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
            );
        const contasAVencer7Dias = Number(contasVencerResult[0]?.count) || 0;
        const valorContasAVencer7Dias = parseFloat(contasVencerResult[0]?.total || '0');

        // Contas a receber nos próximos 7 dias
        const receberVencerResult = await db
            .select({
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
            );
        const receberAVencer7Dias = Number(receberVencerResult[0]?.count) || 0;
        const valorReceberAVencer7Dias = parseFloat(receberVencerResult[0]?.total || '0');

        // Produtos mais vendidos (top 5)
        const produtosMaisVendidos = await db
            .select({
                produtoId: itensVenda.produtoId,
                nome: produtos.nome,
                totalVendido: sql<number>`SUM(${itensVenda.quantidade})`,
                valorTotal: sql<string>`SUM(${itensVenda.subtotal})`,
            })
            .from(itensVenda)
            .innerJoin(produtos, eq(itensVenda.produtoId, produtos.id))
            .groupBy(itensVenda.produtoId, produtos.nome)
            .orderBy(sql`SUM(${itensVenda.quantidade}) DESC`)
            .limit(5);

        // Últimas 3 vendas
        const vendasRecentes = await db
            .select({
                id: vendas.id,
                clienteId: vendas.clienteId,
                total: vendas.total,
                dataVenda: vendas.dataVenda,
                formaPagamento: vendas.formaPagamento,
            })
            .from(vendas)
            .where(eq(vendas.status, 'finalizada'))
            .orderBy(sql`${vendas.dataVenda} DESC`)
            .limit(3);

        // Buscar nomes dos clientes para as vendas recentes
        const vendasComClientes = await Promise.all(
            vendasRecentes.map(async (venda) => {
                if (venda.clienteId) {
                    const cliente = await db
                        .select({ nome: clientes.nome })
                        .from(clientes)
                        .where(eq(clientes.id, venda.clienteId))
                        .limit(1);
                    return { ...venda, clienteNome: cliente[0]?.nome || 'Cliente não encontrado' };
                }
                return { ...venda, clienteNome: 'Venda sem cliente' };
            })
        );

        // Vendas por forma de pagamento
        const vendasPorPagamento = await db
            .select({
                formaPagamento: vendas.formaPagamento,
                count: sql<number>`count(*)`,
                total: sql<string>`COALESCE(SUM(${vendas.total}), 0)`,
            })
            .from(vendas)
            .where(eq(vendas.status, 'finalizada'))
            .groupBy(vendas.formaPagamento);

        // Ticket médio
        const ticketMedio = qtdVendasTotal > 0 ? totalVendasGeral / qtdVendasTotal : 0;

        return NextResponse.json({
            stats: {
                clientes: {
                    total: totalClientes,
                },
                produtos: {
                    total: totalProdutos,
                    estoqueBaixo: produtosEstoqueBaixo,
                },
                fornecedores: {
                    total: totalFornecedores,
                },
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
