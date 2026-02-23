import DashboardNav from "@/components/dashboards/DashboardNav";
import { auth } from "@/auth";

export default async function DashboardsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    return (
        <div className="flex flex-col h-full">
            <DashboardNav userRole={session?.user?.role} />
            <div className="flex-1">
                {children}
            </div>
        </div>
    );
}
