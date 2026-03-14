import { auth } from '@/auth';
import { redirect } from 'next/navigation';

/**
 * Root URL should always land on the login page as per user requirement.
 * This ensures users do not land directly into a "pre-logged-in" portal
 * upon clicking the app link.
 */
export const dynamic = 'force-dynamic';

export default async function RootPage() {
    const session = await auth();

    if (!session || !session.user) {
        redirect('/login');
    }

    const role = session.user.role;

    if (role === 'vendor') redirect('/dashboards/vendor');
    else if (role === 'customer') redirect('/dashboards/customer');
    else if (role === 'manager') redirect('/dashboards/manager');
    else if (role === 'staff' || role === 'user' || role === 'employee') redirect('/dashboards/employee');
    else if (role === 'super-admin' || role === 'admin') redirect('/dashboards/super-admin');
    else redirect('/dashboards/employee');
}
