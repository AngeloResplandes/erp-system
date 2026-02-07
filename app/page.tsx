import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Building2,
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  BarChart3,
  ArrowRight,
  CheckCircle,
  Truck,
} from 'lucide-react';

const features = [
  {
    title: 'Gestão de Clientes',
    description: 'Cadastre e gerencie seus clientes com facilidade',
    icon: Users,
  },
  {
    title: 'Controle de Estoque',
    description: 'Acompanhe seus produtos e níveis de estoque',
    icon: Package,
  },
  {
    title: 'PDV Integrado',
    description: 'Realize vendas de forma rápida e eficiente',
    icon: ShoppingCart,
  },
  {
    title: 'Financeiro Completo',
    description: 'Contas a pagar e receber sob controle',
    icon: DollarSign,
  },
  {
    title: 'Relatórios',
    description: 'Análise completa com gráficos interativos',
    icon: BarChart3,
  },
  {
    title: 'Fornecedores',
    description: 'Gerencie seus fornecedores e pedidos de compra',
    icon: Truck,
  },
];

const technologies = [
  'Next.js 16',
  'React 19',
  'TypeScript',
  'Tailwind CSS',
  'Shadcn UI',
  'Drizzle ORM',
  'PostgreSQL',
  'TanStack Query',
];

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-muted">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="flex justify-center mb-6">
            <div className="flex items-center gap-3 bg-primary/10 px-4 py-2 rounded-full">
              <Building2 className="h-8 w-8 text-primary" />
              <span className="font-bold text-2xl">ERP System</span>
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Sistema ERP Completo para{' '}
            <span className="text-primary">Gestão Empresarial</span>
          </h1>

          <p className="text-xl text-muted-foreground mb-8">
            Uma solução moderna e completa para gerenciar clientes, produtos,
            vendas e finanças do seu negócio. Construído com as tecnologias
            mais modernas do mercado.
          </p>

          <div className="flex gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="gap-2 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/25 cursor-pointer">
                Acessar Sistema <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline" className="transition-all duration-300 hover:scale-105 hover:shadow-lg hover:bg-primary/10 cursor-pointer">
                Criar Conta
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="bg-card/50 backdrop-blur transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/10 hover:border-primary/50 group"
            >
              <CardHeader>
                <feature.icon className="h-10 w-10 text-primary mb-2 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" />
                <CardTitle className="transition-colors duration-300 group-hover:text-primary">{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Tech Stack */}
        <Card className="max-w-2xl mx-auto transition-all duration-300 hover:shadow-xl hover:shadow-primary/10">
          <CardHeader className="text-center">
            <CardTitle>Stack Tecnológica</CardTitle>
            <CardDescription>
              Construído com tecnologias modernas e escaláveis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 justify-center">
              {technologies.map((tech) => (
                <div
                  key={tech}
                  className="flex items-center gap-1 bg-primary/10 px-3 py-1 rounded-full text-sm transition-all duration-300 hover:bg-primary/20 hover:scale-105 hover:shadow-md"
                >
                  <CheckCircle className="h-3 w-3 text-primary" />
                  {tech}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-16 text-muted-foreground">
          <p>
            Projeto de portfólio desenvolvido com Next.js, Tailwind CSS e Shadcn UI
          </p>
          <p className="text-sm mt-2">
            © 2026 ERP System. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}
