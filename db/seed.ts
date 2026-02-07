import 'dotenv/config';
import { config } from 'dotenv';

// Carregar variáveis do .env.local
config({ path: '.env.local' });

import { db } from './index';
import {
    usuarios,
    clientes,
    categorias,
    produtos,
    fornecedores,
    vendas,
    itensVenda,
    contasPagar,
    contasReceber
} from './schema';
import { hash } from 'bcryptjs';

// Função para gerar CPF fictício
function gerarCPF(): string {
    const n = () => Math.floor(Math.random() * 10);
    return `${n()}${n()}${n()}.${n()}${n()}${n()}.${n()}${n()}${n()}-${n()}${n()}`;
}

// Função para gerar CNPJ fictício
function gerarCNPJ(): string {
    const n = () => Math.floor(Math.random() * 10);
    return `${n()}${n()}.${n()}${n()}${n()}.${n()}${n()}${n()}/0001-${n()}${n()}`;
}

// Função para gerar telefone fictício
function gerarTelefone(): string {
    const n = () => Math.floor(Math.random() * 10);
    return `(${Math.floor(Math.random() * 90) + 10}) 9${n()}${n()}${n()}${n()}-${n()}${n()}${n()}${n()}`;
}

// Função para gerar data aleatória nos últimos N dias
function dataAleatoria(diasAtras: number): Date {
    const hoje = new Date();
    const dataPassada = new Date(hoje.getTime() - Math.random() * diasAtras * 24 * 60 * 60 * 1000);
    return dataPassada;
}

// Função para gerar data futura nos próximos N dias
function dataFutura(diasFrente: number): string {
    const hoje = new Date();
    const dataFutura = new Date(hoje.getTime() + Math.random() * diasFrente * 24 * 60 * 60 * 1000);
    return dataFutura.toISOString().split('T')[0];
}

export async function seed() {
    console.log('🌱 Iniciando seed do banco de dados...\n');

    try {
        // ==================== USUÁRIOS ====================
        console.log('👤 Criando usuários...');
        const senhaHash = await hash('123456', 10);

        const usuariosData = [
            { nome: 'Admin Sistema', email: 'admin@erp.com', senhaHash, role: 'admin' as const },
            { nome: 'Maria Gerente', email: 'maria@erp.com', senhaHash, role: 'gerente' as const },
            { nome: 'João Vendedor', email: 'joao@erp.com', senhaHash, role: 'vendedor' as const },
            { nome: 'Ana Silva', email: 'ana@erp.com', senhaHash, role: 'vendedor' as const },
            { nome: 'Carlos Santos', email: 'carlos@erp.com', senhaHash, role: 'vendedor' as const },
        ];

        const usuariosCriados = await db.insert(usuarios).values(usuariosData).returning();
        console.log(`   ✅ ${usuariosCriados.length} usuários criados`);

        // ==================== CLIENTES ====================
        console.log('👥 Criando clientes...');
        const clientesData = [
            { nome: 'Tech Solutions Ltda', email: 'contato@techsolutions.com', telefone: gerarTelefone(), cpfCnpj: gerarCNPJ(), cidade: 'São Paulo', estado: 'SP', endereco: 'Av. Paulista, 1000' },
            { nome: 'Comércio ABC', email: 'vendas@comercioabc.com', telefone: gerarTelefone(), cpfCnpj: gerarCNPJ(), cidade: 'Rio de Janeiro', estado: 'RJ', endereco: 'Rua Copacabana, 500' },
            { nome: 'José Almeida', email: 'jose.almeida@gmail.com', telefone: gerarTelefone(), cpfCnpj: gerarCPF(), cidade: 'Belo Horizonte', estado: 'MG', endereco: 'Rua dos Pinheiros, 123' },
            { nome: 'Fernanda Costa', email: 'fernanda.costa@outlook.com', telefone: gerarTelefone(), cpfCnpj: gerarCPF(), cidade: 'Curitiba', estado: 'PR', endereco: 'Av. Brasil, 456' },
            { nome: 'Distribuidora XYZ', email: 'contato@xyz.com', telefone: gerarTelefone(), cpfCnpj: gerarCNPJ(), cidade: 'Porto Alegre', estado: 'RS', endereco: 'Rua Farroupilha, 789' },
            { nome: 'Roberto Oliveira', email: 'roberto.oliveira@hotmail.com', telefone: gerarTelefone(), cpfCnpj: gerarCPF(), cidade: 'Salvador', estado: 'BA', endereco: 'Av. Oceânica, 1500' },
            { nome: 'Supermercado Central', email: 'central@super.com', telefone: gerarTelefone(), cpfCnpj: gerarCNPJ(), cidade: 'Recife', estado: 'PE', endereco: 'Rua Boa Vista, 200' },
            { nome: 'Lúcia Fernandes', email: 'lucia.f@gmail.com', telefone: gerarTelefone(), cpfCnpj: gerarCPF(), cidade: 'Fortaleza', estado: 'CE', endereco: 'Av. Beira Mar, 3000' },
            { nome: 'Indústria Metalmax', email: 'comercial@metalmax.com', telefone: gerarTelefone(), cpfCnpj: gerarCNPJ(), cidade: 'Joinville', estado: 'SC', endereco: 'Rod. SC-101, Km 5' },
            { nome: 'Pedro Martins', email: 'pedro.martins@yahoo.com', telefone: gerarTelefone(), cpfCnpj: gerarCPF(), cidade: 'Brasília', estado: 'DF', endereco: 'SQN 205, Bloco A' },
            { nome: 'Farmácia Popular', email: 'farmacia@popular.com', telefone: gerarTelefone(), cpfCnpj: gerarCNPJ(), cidade: 'Goiânia', estado: 'GO', endereco: 'Av. T-1, 100' },
            { nome: 'Márcia Souza', email: 'marcia.souza@gmail.com', telefone: gerarTelefone(), cpfCnpj: gerarCPF(), cidade: 'Manaus', estado: 'AM', endereco: 'Rua Amazonas, 555' },
            { nome: 'Constrular Materiais', email: 'vendas@constrular.com', telefone: gerarTelefone(), cpfCnpj: gerarCNPJ(), cidade: 'Campinas', estado: 'SP', endereco: 'Av. das Amoreiras, 800' },
            { nome: 'Ricardo Lima', email: 'ricardo.lima@outlook.com', telefone: gerarTelefone(), cpfCnpj: gerarCPF(), cidade: 'Vitória', estado: 'ES', endereco: 'Rua da Praia, 300' },
            { nome: 'Auto Peças Brasil', email: 'autopecas@brasil.com', telefone: gerarTelefone(), cpfCnpj: gerarCNPJ(), cidade: 'Uberlândia', estado: 'MG', endereco: 'Rod. BR-050, Km 10' },
        ];

        const clientesCriados = await db.insert(clientes).values(clientesData).returning();
        console.log(`   ✅ ${clientesCriados.length} clientes criados`);

        // ==================== CATEGORIAS ====================
        console.log('📁 Criando categorias...');
        const categoriasData = [
            { nome: 'Eletrônicos', descricao: 'Produtos eletrônicos em geral' },
            { nome: 'Informática', descricao: 'Computadores, periféricos e acessórios' },
            { nome: 'Escritório', descricao: 'Material de escritório e papelaria' },
            { nome: 'Móveis', descricao: 'Móveis para casa e escritório' },
            { nome: 'Eletrodomésticos', descricao: 'Eletrodomésticos diversos' },
            { nome: 'Ferramentas', descricao: 'Ferramentas manuais e elétricas' },
        ];

        const categoriasCriadas = await db.insert(categorias).values(categoriasData).returning();
        console.log(`   ✅ ${categoriasCriadas.length} categorias criadas`);

        // ==================== PRODUTOS ====================
        console.log('📦 Criando produtos...');
        const produtosData = [
            { nome: 'Notebook Dell Inspiron 15', descricao: 'Intel Core i5, 8GB RAM, 256GB SSD', categoriaId: categoriasCriadas[1].id, precoCusto: '2500.00', precoVenda: '3499.99', estoqueAtual: 25, estoqueMinimo: 5, codigoBarras: '789001001001' },
            { nome: 'Mouse Logitech MX Master', descricao: 'Mouse sem fio ergonômico', categoriaId: categoriasCriadas[1].id, precoCusto: '350.00', precoVenda: '549.90', estoqueAtual: 50, estoqueMinimo: 10, codigoBarras: '789001001002' },
            { nome: 'Teclado Mecânico RGB', descricao: 'Teclado gamer com iluminação RGB', categoriaId: categoriasCriadas[1].id, precoCusto: '200.00', precoVenda: '349.90', estoqueAtual: 35, estoqueMinimo: 10, codigoBarras: '789001001003' },
            { nome: 'Monitor LG 27" 4K', descricao: 'Monitor IPS 4K UHD', categoriaId: categoriasCriadas[0].id, precoCusto: '1500.00', precoVenda: '2199.90', estoqueAtual: 15, estoqueMinimo: 5, codigoBarras: '789001001004' },
            { nome: 'Smartphone Samsung Galaxy', descricao: 'Galaxy S23, 128GB', categoriaId: categoriasCriadas[0].id, precoCusto: '2800.00', precoVenda: '3999.00', estoqueAtual: 30, estoqueMinimo: 10, codigoBarras: '789001001005' },
            { nome: 'Cadeira Escritório Ergonômica', descricao: 'Cadeira com apoio lombar', categoriaId: categoriasCriadas[3].id, precoCusto: '400.00', precoVenda: '699.90', estoqueAtual: 20, estoqueMinimo: 5, codigoBarras: '789001001006' },
            { nome: 'Mesa Escritório 1.40m', descricao: 'Mesa em MDF com gavetas', categoriaId: categoriasCriadas[3].id, precoCusto: '350.00', precoVenda: '599.90', estoqueAtual: 12, estoqueMinimo: 3, codigoBarras: '789001001007' },
            { nome: 'Resma Papel A4 500 folhas', descricao: 'Papel sulfite 75g/m²', categoriaId: categoriasCriadas[2].id, precoCusto: '18.00', precoVenda: '29.90', estoqueAtual: 200, estoqueMinimo: 50, codigoBarras: '789001001008' },
            { nome: 'Caneta Esferográfica (caixa 50)', descricao: 'Caneta azul ponta média', categoriaId: categoriasCriadas[2].id, precoCusto: '25.00', precoVenda: '45.00', estoqueAtual: 100, estoqueMinimo: 20, codigoBarras: '789001001009' },
            { nome: 'Micro-ondas 30L', descricao: 'Micro-ondas com grill', categoriaId: categoriasCriadas[4].id, precoCusto: '400.00', precoVenda: '649.90', estoqueAtual: 18, estoqueMinimo: 5, codigoBarras: '789001001010' },
            { nome: 'Geladeira Frost Free 400L', descricao: 'Geladeira duas portas', categoriaId: categoriasCriadas[4].id, precoCusto: '1800.00', precoVenda: '2899.00', estoqueAtual: 8, estoqueMinimo: 3, codigoBarras: '789001001011' },
            { nome: 'Furadeira Elétrica 600W', descricao: 'Furadeira de impacto', categoriaId: categoriasCriadas[5].id, precoCusto: '150.00', precoVenda: '249.90', estoqueAtual: 40, estoqueMinimo: 10, codigoBarras: '789001001012' },
            { nome: 'Kit Chaves de Fenda 20pcs', descricao: 'Conjunto de chaves profissional', categoriaId: categoriasCriadas[5].id, precoCusto: '80.00', precoVenda: '139.90', estoqueAtual: 60, estoqueMinimo: 15, codigoBarras: '789001001013' },
            { nome: 'Webcam Full HD', descricao: 'Webcam 1080p com microfone', categoriaId: categoriasCriadas[1].id, precoCusto: '120.00', precoVenda: '199.90', estoqueAtual: 45, estoqueMinimo: 10, codigoBarras: '789001001014' },
            { nome: 'Headset Gamer', descricao: 'Fone com microfone para jogos', categoriaId: categoriasCriadas[0].id, precoCusto: '180.00', precoVenda: '299.90', estoqueAtual: 55, estoqueMinimo: 15, codigoBarras: '789001001015' },
        ];

        const produtosCriados = await db.insert(produtos).values(produtosData).returning();
        console.log(`   ✅ ${produtosCriados.length} produtos criados`);

        // ==================== FORNECEDORES ====================
        console.log('🏭 Criando fornecedores...');
        const fornecedoresData = [
            { nome: 'TechDistribuidora', cnpj: gerarCNPJ(), telefone: gerarTelefone(), email: 'vendas@techdist.com', endereco: 'Av. Industrial, 1000 - SP' },
            { nome: 'InfoSupply Brasil', cnpj: gerarCNPJ(), telefone: gerarTelefone(), email: 'comercial@infosupply.com', endereco: 'Rua Tech, 500 - RJ' },
            { nome: 'Papelaria Central', cnpj: gerarCNPJ(), telefone: gerarTelefone(), email: 'pedidos@papelariacentral.com', endereco: 'Rua do Comércio, 200 - MG' },
            { nome: 'MóveisPro Indústria', cnpj: gerarCNPJ(), telefone: gerarTelefone(), email: 'contato@moveispro.com', endereco: 'Rod. BR-116, Km 20 - PR' },
            { nome: 'Eletro Atacado', cnpj: gerarCNPJ(), telefone: gerarTelefone(), email: 'vendas@eletroatacado.com', endereco: 'Av. dos Estados, 3000 - RS' },
            { nome: 'Ferramentas Express', cnpj: gerarCNPJ(), telefone: gerarTelefone(), email: 'suporte@ferramentasexpress.com', endereco: 'Rua Industrial, 800 - SC' },
            { nome: 'Digital Components', cnpj: gerarCNPJ(), telefone: gerarTelefone(), email: 'sales@digitalcomp.com', endereco: 'Av. Tecnologia, 1500 - SP' },
            { nome: 'Mega Suprimentos', cnpj: gerarCNPJ(), telefone: gerarTelefone(), email: 'compras@megasuprimentos.com', endereco: 'Rua do Atacado, 700 - GO' },
        ];

        const fornecedoresCriados = await db.insert(fornecedores).values(fornecedoresData).returning();
        console.log(`   ✅ ${fornecedoresCriados.length} fornecedores criados`);

        // ==================== VENDAS ====================
        console.log('🛒 Criando vendas...');
        const formasPagamento = ['dinheiro', 'pix', 'cartao_credito', 'cartao_debito', 'boleto'] as const;
        const vendasCriadas = [];

        for (let i = 0; i < 20; i++) {
            const clienteAleatorio = clientesCriados[Math.floor(Math.random() * clientesCriados.length)];
            const usuarioAleatorio = usuariosCriados[Math.floor(Math.random() * usuariosCriados.length)];
            const formaPagamento = formasPagamento[Math.floor(Math.random() * formasPagamento.length)];

            // Selecionar 1-4 produtos aleatórios para esta venda
            const qtdProdutos = Math.floor(Math.random() * 4) + 1;
            const produtosSelecionados: typeof produtosCriados = [];
            for (let j = 0; j < qtdProdutos; j++) {
                const prod = produtosCriados[Math.floor(Math.random() * produtosCriados.length)];
                if (!produtosSelecionados.find(p => p.id === prod.id)) {
                    produtosSelecionados.push(prod);
                }
            }

            // Calcular total da venda
            let subtotal = 0;
            const itensParaInserir = produtosSelecionados.map(prod => {
                const quantidade = Math.floor(Math.random() * 5) + 1;
                const precoUnitario = parseFloat(prod.precoVenda);
                const itemSubtotal = quantidade * precoUnitario;
                subtotal += itemSubtotal;
                return {
                    produtoId: prod.id,
                    quantidade,
                    precoUnitario: prod.precoVenda,
                    desconto: '0',
                    subtotal: itemSubtotal.toFixed(2)
                };
            });

            const desconto = Math.random() > 0.7 ? subtotal * 0.1 : 0;
            const total = subtotal - desconto;

            const [vendaCriada] = await db.insert(vendas).values({
                clienteId: clienteAleatorio.id,
                usuarioId: usuarioAleatorio.id,
                dataVenda: dataAleatoria(90),
                status: 'finalizada',
                subtotal: subtotal.toFixed(2),
                desconto: desconto.toFixed(2),
                total: total.toFixed(2),
                formaPagamento,
            }).returning();

            vendasCriadas.push(vendaCriada);

            // Inserir itens da venda
            await db.insert(itensVenda).values(
                itensParaInserir.map(item => ({ ...item, vendaId: vendaCriada.id }))
            );

            // Criar conta a receber para vendas a boleto
            if (formaPagamento === 'boleto') {
                await db.insert(contasReceber).values({
                    clienteId: clienteAleatorio.id,
                    vendaId: vendaCriada.id,
                    valor: total.toFixed(2),
                    dataVencimento: dataFutura(30),
                    status: 'pendente',
                });
            }
        }

        console.log(`   ✅ ${vendasCriadas.length} vendas criadas com itens`);

        // ==================== CONTAS A PAGAR ====================
        console.log('💰 Criando contas a pagar...');
        const contasPagarData = [
            { descricao: 'Aluguel do escritório', valor: '3500.00', dataVencimento: dataFutura(10), fornecedorId: null, categoria: 'Aluguel', status: 'pendente' as const },
            { descricao: 'Energia elétrica', valor: '850.00', dataVencimento: dataFutura(5), fornecedorId: null, categoria: 'Utilidades', status: 'pendente' as const },
            { descricao: 'Internet e telefonia', valor: '450.00', dataVencimento: dataFutura(15), fornecedorId: null, categoria: 'Utilidades', status: 'pendente' as const },
            { descricao: 'Compra de notebooks', valor: '12500.00', dataVencimento: dataFutura(20), fornecedorId: fornecedoresCriados[0].id, categoria: 'Estoque', status: 'pendente' as const },
            { descricao: 'Material de escritório', valor: '380.00', dataVencimento: dataFutura(7), fornecedorId: fornecedoresCriados[2].id, categoria: 'Material', status: 'pendente' as const },
            { descricao: 'Manutenção ar-condicionado', valor: '600.00', dataVencimento: dataFutura(3), fornecedorId: null, categoria: 'Manutenção', status: 'pendente' as const },
            { descricao: 'Compra de móveis', valor: '4200.00', dataVencimento: dataFutura(25), fornecedorId: fornecedoresCriados[3].id, categoria: 'Estoque', status: 'pendente' as const },
            { descricao: 'Seguro empresarial', valor: '1200.00', dataVencimento: dataFutura(12), fornecedorId: null, categoria: 'Seguros', status: 'pago' as const },
            { descricao: 'Software e licenças', valor: '890.00', dataVencimento: dataFutura(8), fornecedorId: null, categoria: 'Tecnologia', status: 'pendente' as const },
            { descricao: 'Compra de ferramentas', valor: '2100.00', dataVencimento: dataFutura(18), fornecedorId: fornecedoresCriados[5].id, categoria: 'Estoque', status: 'pendente' as const },
        ];

        const contasPagarCriadas = await db.insert(contasPagar).values(contasPagarData).returning();
        console.log(`   ✅ ${contasPagarCriadas.length} contas a pagar criadas`);

        // ==================== MAIS CONTAS A RECEBER ====================
        console.log('📥 Criando contas a receber adicionais...');
        const contasReceberData = [
            { clienteId: clientesCriados[0].id, valor: '5000.00', dataVencimento: dataFutura(15), status: 'pendente' as const },
            { clienteId: clientesCriados[1].id, valor: '3200.00', dataVencimento: dataFutura(10), status: 'pendente' as const },
            { clienteId: clientesCriados[4].id, valor: '8500.00', dataVencimento: dataFutura(20), status: 'pendente' as const },
            { clienteId: clientesCriados[6].id, valor: '2100.00', dataVencimento: dataFutura(5), status: 'pago' as const },
            { clienteId: clientesCriados[8].id, valor: '12000.00', dataVencimento: dataFutura(30), status: 'pendente' as const },
        ];

        const contasReceberCriadas = await db.insert(contasReceber).values(contasReceberData).returning();
        console.log(`   ✅ ${contasReceberCriadas.length} contas a receber adicionais criadas`);

        console.log('\n✅ Seed concluído com sucesso!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📊 Resumo:');
        console.log(`   • ${usuariosCriados.length} usuários`);
        console.log(`   • ${clientesCriados.length} clientes`);
        console.log(`   • ${categoriasCriadas.length} categorias`);
        console.log(`   • ${produtosCriados.length} produtos`);
        console.log(`   • ${fornecedoresCriados.length} fornecedores`);
        console.log(`   • ${vendasCriadas.length} vendas`);
        console.log(`   • ${contasPagarCriadas.length} contas a pagar`);
        console.log(`   • ${contasReceberCriadas.length + vendasCriadas.filter(v => v.formaPagamento === 'boleto').length} contas a receber`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    } catch (error) {
        console.error('❌ Erro durante o seed:', error);
        throw error;
    }
}

// Executar se chamado diretamente
seed()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
