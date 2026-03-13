import { auth } from '@/auth';
import { redirect } from 'next/navigation';

// Root URL redirects based on authentication status.
// If logged in, users go to their specific dashboard.
// If NOT logged in, they go to the login page.
export default async function RootPage() {
    const session = await auth();

    if (!session) {
        redirect('/login');
    }

    const role = session.user?.role;

    if (role === 'vendor') redirect('/dashboards/vendor');
    else if (role === 'customer') redirect('/dashboards/customer');
    else if (role === 'manager') redirect('/dashboards/manager');
    else if (role === 'staff' || role === 'user' || role === 'employee') redirect('/dashboards/employee');
    else if (role === 'super-admin' || role === 'admin') redirect('/dashboards/super-admin');
    else redirect('/dashboards/employee'); // fallback — show staff dashboard for unknown roles
}
