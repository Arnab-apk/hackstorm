'use client';

import { cn } from '@/lib/utils';
import CountUp from '@/components/react-bits/text/CountUp';
import SpotlightCard from '@/components/react-bits/components/SpotlightCard';

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
  const numericValue = typeof value === 'number' ? value : parseInt(value, 10);
  const isNumeric = !isNaN(numericValue);

  return (
    <SpotlightCard
      className={cn(
        'group shadow-lg shadow-black/20 transition-all duration-300 hover:border-primary/30 hover:shadow-primary/10 hover:shadow-xl',
        className
      )}
      spotlightColor="rgba(20, 184, 166, 0.15)"
    >
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1.5">{label}</p>
            <p className="text-2xl font-bold tracking-tight sm:text-3xl">
              {isNumeric ? (
                <CountUp to={numericValue} duration={2} separator="," />
              ) : (
                value
              )}
            </p>
            {trend && (
              <p
                className={cn(
                  'mt-2 text-xs font-medium flex items-center gap-1',
                  trend.isPositive ? 'text-success' : 'text-destructive'
                )}
              >
                <span className={cn(
                  'inline-block transition-transform',
                  trend.isPositive ? 'rotate-0' : 'rotate-180'
                )}>
                  ↑
                </span>
                {Math.abs(trend.value)}% from last month
              </p>
            )}
          </div>
          <div className="rounded-xl bg-primary/10 p-3 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 group-hover:shadow-lg group-hover:shadow-primary/20 group-hover:scale-110">
            {icon}
          </div>
        </div>
      </div>
    </SpotlightCard>
  );
}

export { StatCard };
