import { AuthProvider } from '@/contexts/auth-context';
import { QueryProvider } from '@/contexts/query-provider';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { Toaster } from '@/components/ui/sonner';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <QueryProvider>
            <AuthProvider>
                <div className="flex min-h-screen">
                    <AppSidebar>{children}</AppSidebar>
                </div>
                <Toaster />
            </AuthProvider>
        </QueryProvider>
    );
}
