export default function AdminLoading() {
    return (
        <div className="p-6 space-y-6 animate-pulse">
            <div className="h-8 w-40 bg-muted rounded" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="rounded-xl border bg-card p-5 h-32 bg-muted/40" />
                ))}
            </div>
        </div>
    );
}
