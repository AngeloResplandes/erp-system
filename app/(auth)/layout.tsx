import { AuthProvider } from '@/contexts/auth-context';
import { Toaster } from '@/components/ui/sonner';

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AuthProvider>
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
                {children}
            </div>
            <Toaster />
        </AuthProvider>
    );
}
