interface SkeletonProps {
  className?: string;
  lines?: number;
}

export const Skeleton = ({ className = "", lines }: SkeletonProps) => {
  if (lines && lines > 1) {
    return (
      <div className="space-y-2">
        {Array(lines)
          .fill(0)
          .map((_, i) => (
            <div key={i} className={`bg-surface-skeleton animate-pulse rounded ${className}`} />
          ))}
      </div>
    );
  }
  return <div className={`bg-surface-skeleton animate-pulse rounded ${className}`} />;
};

export const CardSkeleton = () => (
  <div className="bg-surface-card p-5 rounded-card border border-border-subtle animate-pulse">
    <div className="h-8 w-8 bg-surface-skeleton rounded mb-4" />
    <div className="h-4 bg-surface-skeleton rounded w-3/4 mb-2" />
    <div className="h-3 bg-surface-elevated rounded w-1/2 mb-4" />
    <div className="h-8 bg-surface-skeleton rounded" />
  </div>
);

export const TableRowSkeleton = ({ cols = 3 }: { cols?: number }) => (
  <tr>
    {Array(cols)
      .fill(0)
      .map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div
            className="h-3 bg-surface-skeleton animate-pulse rounded"
            style={{ width: `${60 + (i % 3) * 15}%` }}
          />
        </td>
      ))}
  </tr>
);
