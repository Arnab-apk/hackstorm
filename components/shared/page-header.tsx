'use client';

import { cn } from '@/lib/utils';
import BlurText from '@/components/react-bits/text/BlurText';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

function PageHeader({ title, description, action, className }: PageHeaderProps) {
  return (
    <div className={cn('flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between', className)}>
      <div>
        <BlurText
          text={title}
          className="text-2xl font-semibold tracking-tight"
          delay={80}
          animateBy="words"
        />
        {description && (
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export { PageHeader };
