import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import ExecutiveDashboard from '@/components/dashboards/ExecutiveDashboard';
import DashboardNav from '@/components/dashboards/DashboardNav';

export default async function DashboardPage() {
  const session = await auth();

  if (session?.user?.role === 'vendor') {
    redirect('/dashboards/vendor');
  }

  if (session?.user?.role === 'customer') {
    redirect('/dashboards/customer');
  }

  if (session?.user?.role === 'manager') {
    redirect('/dashboards/manager');
  }

  if (session?.user?.role === 'staff' || session?.user?.role === 'user') {
    redirect('/dashboards/employee');
  }

  // Admin and other roles see the Executive Dashboard
  return (
    <div className="flex flex-col h-full">
      <DashboardNav userRole={session?.user?.role} />
      <ExecutiveDashboard user={session?.user} />
    </div>
  );
}
