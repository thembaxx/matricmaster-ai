'use client';

import { m, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AIThinkingGradientProps {
  isThinking: boolean;
  className?: string;
}

const colors = [
  'bg-electric-blue',
  'bg-purple-500',
  'bg-cyan-400',
  'bg-indigo-500',
];

export function AIThinkingGradient({ isThinking, className }: AIThinkingGradientProps) {
  return (
    <AnimatePresence>
      {isThinking && (
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={cn(
            'absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-inherit',
            className
          )}
        >
          {/* Animated Gradient Orbs */}
          {[0, 1, 2, 3].map((i) => (
            <m.div
              key={i}
              animate={{
                x: [
                  Math.random() * 100 - 50 + '%',
                  Math.random() * 100 - 50 + '%',
                ],
                y: [
                  Math.random() * 100 - 50 + '%',
                  Math.random() * 100 - 50 + '%',
                ],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 8 + i * 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className={cn(
                'absolute top-1/2 left-1/2 w-full h-full -translate-x-1/2 -translate-y-1/2 rounded-full blur-[80px] opacity-40',
                colors[i % colors.length]
              )}
            />
          ))}

          {/* Subtle Overlay to blend */}
          <div className="absolute inset-0 bg-background/20 backdrop-blur-[2px]" />
        </m.div>
      )}
    </AnimatePresence>
  );
}
