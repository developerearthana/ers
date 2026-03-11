import { auth } from '@/auth';
import HRMLayoutClient from '@/components/hrm/HRMLayoutClient';

export default async function HRMLayout({ children }: { children: React.ReactNode }) {
    const session = await auth();
    const role = session?.user?.role || '';

    // Delegate layout rendering to the Client Component
    return (
        <HRMLayoutClient role={role}>
            {children}
        </HRMLayoutClient>
    );
}
