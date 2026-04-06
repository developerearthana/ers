export default function ContactsLoading() {
    return (
        <div className="p-6 space-y-6 animate-pulse">
            <div className="flex items-center justify-between">
                <div className="h-8 w-36 bg-muted rounded" />
                <div className="h-9 w-32 bg-muted rounded" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="rounded-xl border bg-card p-5 space-y-3">
                        <div className="h-4 w-20 bg-muted rounded" />
                        <div className="h-8 w-16 bg-muted rounded" />
                    </div>
                ))}
            </div>
            <div className="rounded-xl border bg-card">
                <div className="p-4 space-y-3">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="h-12 bg-muted/40 rounded" />
                    ))}
                </div>
            </div>
        </div>
    );
}
