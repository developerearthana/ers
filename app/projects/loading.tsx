export default function ProjectsLoading() {
    return (
        <div className="p-6 space-y-6 animate-pulse">
            <div className="flex items-center justify-between">
                <div className="h-8 w-36 bg-muted rounded" />
                <div className="h-9 w-32 bg-muted rounded" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="rounded-xl border bg-card p-5 space-y-3">
                        <div className="h-5 w-40 bg-muted rounded" />
                        <div className="h-4 w-full bg-muted/60 rounded" />
                        <div className="h-2 w-full bg-muted rounded-full" />
                        <div className="flex gap-2">
                            <div className="h-6 w-16 bg-muted rounded-full" />
                            <div className="h-6 w-20 bg-muted rounded-full" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
