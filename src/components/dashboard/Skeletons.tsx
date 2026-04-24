export const SkeletonRow = () => (
  <div className="flex gap-4 py-3 border-b border-border/30 animate-pulse">
    <div className="h-4 bg-muted rounded w-1/4" />
    <div className="h-4 bg-muted rounded w-1/4" />
    <div className="h-4 bg-muted rounded w-1/4" />
    <div className="h-4 bg-muted rounded w-1/4" />
  </div>
);

export const SkeletonCard = () => (
  <div className="glass-card rounded-xl overflow-hidden animate-pulse">
    <div className="aspect-[4/3] bg-muted" />
    <div className="p-5 space-y-3">
      <div className="h-5 bg-muted rounded w-2/3" />
      <div className="h-3 bg-muted rounded w-1/3" />
    </div>
  </div>
);

export const SkeletonStat = () => (
  <div className="glass-card rounded-xl p-5 animate-pulse space-y-2">
    <div className="h-3 bg-muted rounded w-1/2" />
    <div className="h-8 bg-muted rounded w-1/3" />
  </div>
);
