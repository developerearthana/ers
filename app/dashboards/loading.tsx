export default function DashboardsLoading() {
    return (
        <div className="p-6 space-y-6 animate-pulse">
            <div className="h-8 w-52 bg-muted rounded" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="rounded-xl border bg-card p-5 space-y-3">
                        <div className="h-4 w-24 bg-muted rounded" />
                        <div className="h-8 w-28 bg-muted rounded" />
                        <div className="h-3 w-20 bg-muted/60 rounded" />
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 rounded-xl border bg-card p-5 h-72 bg-muted/40" />
                <div className="rounded-xl border bg-card p-5 h-72 bg-muted/40" />
            </div>
        </div>
    );
}
