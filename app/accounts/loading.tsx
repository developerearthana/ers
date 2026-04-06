export default function AccountsLoading() {
    return (
        <div className="p-6 space-y-6 animate-pulse">
            <div className="h-8 w-48 bg-muted rounded" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="rounded-xl border bg-card p-5 space-y-3">
                        <div className="h-4 w-24 bg-muted rounded" />
                        <div className="h-8 w-28 bg-muted rounded" />
                    </div>
                ))}
            </div>
            <div className="rounded-xl border bg-card p-5 h-80 bg-muted/40" />
        </div>
    );
}
