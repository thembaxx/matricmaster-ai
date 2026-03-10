'use client';

import { m } from 'framer-motion';
import { ArrowRight01Icon } from 'hugeicons-react';
import { cn } from '@/lib/utils';

interface SubjectCardProps {
  id: string;
  name: string;
  topics: string;
  icon: React.ElementType;
  onClick: () => void;
  layoutId?: string;
  className?: string;
}

export function SubjectCard({
  id,
  name,
  topics,
  icon: Icon,
  onClick,
  layoutId,
  className,
}: SubjectCardProps) {
  return (
    <m.div
      layoutId={layoutId}
      onClick={onClick}
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={cn(
        'group relative w-full bg-white dark:bg-neutral-900 squircle p-8 border border-border/50 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden',
        className
      )}
    >
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center group-hover:bg-electric-blue/10 transition-colors">
            <Icon weight="bold" className="w-8 h-8 text-foreground group-hover:text-electric-blue transition-colors" />
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-bold tracking-tight text-foreground uppercase">
              {name}
            </h3>
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              {topics}
            </p>
          </div>
        </div>

        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0">
          <ArrowRight01Icon size={20} className="text-foreground" />
        </div>
      </div>

      {/* Subtle background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-electric-blue/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-electric-blue/10 transition-all" />
    </m.div>
  );
}
