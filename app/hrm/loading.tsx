export default function HRMLoading() {
    return (
        <div className="p-6 space-y-6 animate-pulse">
            <div className="h-8 w-48 bg-muted rounded" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="rounded-xl border bg-card p-5 space-y-3">
                        <div className="h-4 w-24 bg-muted rounded" />
                        <div className="h-8 w-16 bg-muted rounded" />
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border bg-card p-5 space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-muted rounded-full" />
                            <div className="flex-1 space-y-1">
                                <div className="h-4 w-32 bg-muted rounded" />
                                <div className="h-3 w-24 bg-muted/60 rounded" />
                            </div>
                        </div>
                    ))}
                </div>
                <div className="rounded-xl border bg-card p-5 h-64 bg-muted/40" />
            </div>
        </div>
    );
}
