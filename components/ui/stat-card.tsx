import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

function StatCard({ label, value, icon, trend, className }: StatCardProps) {
  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-lg border border-border bg-card p-5 shadow-sm shadow-black/10 transition-all duration-200 hover:border-primary/30 hover:shadow-glow-sm',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{label}</p>
          <p className="text-2xl font-bold tracking-tight sm:text-3xl">{value}</p>
          {trend && (
            <p
              className={cn(
                'mt-2 text-xs font-medium',
                trend.isPositive ? 'text-success' : 'text-destructive'
              )}
            >
              {trend.isPositive ? '+' : ''}{trend.value}% from last month
            </p>
          )}
        </div>
        <div className="rounded-md bg-primary/10 p-3 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
          {icon}
        </div>
      </div>
      
      {/* Decorative gradient */}
      <div className="absolute bottom-0 right-0 h-px w-1/2 bg-gradient-to-l from-primary/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
    </div>
  );
}

export { StatCard };
