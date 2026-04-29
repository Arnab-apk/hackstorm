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
        'group shadow-sm shadow-black/10 transition-all duration-200 hover:border-primary/30 hover:shadow-glow-sm',
        className
      )}
      spotlightColor="rgba(20, 184, 166, 0.12)"
    >
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{label}</p>
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
      </div>
    </SpotlightCard>
  );
}

export { StatCard };
