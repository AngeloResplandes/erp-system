import Link from 'next/link';
import { Button } from '@/components/ui/button';
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
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
              <Button size="lg" className="gap-2">
                Acessar Sistema <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline">
                Criar Conta
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {features.map((feature) => (
            <Card key={feature.title} className="bg-card/50 backdrop-blur">
              <CardHeader>
                <feature.icon className="h-10 w-10 text-primary mb-2" />
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Tech Stack */}
        <Card className="max-w-2xl mx-auto">
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
                  className="flex items-center gap-1 bg-primary/10 px-3 py-1 rounded-full text-sm"
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
