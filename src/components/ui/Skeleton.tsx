import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  variant?: 'default' | 'circular' | 'rounded' | 'text';
  animate?: 'shimmer' | 'pulse' | 'none';
  style?: React.CSSProperties;
}

/**
 * Reusable Skeleton animation component using Tailwind CSS with shimmer effects
 * for use across application loading states.
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'default',
  animate = 'shimmer',
  style,
  ...props
}) => {
  const variantStyles = {
    default: 'rounded-lg',
    rounded: 'rounded-2xl',
    circular: 'rounded-full',
    text: 'rounded h-4 w-full my-1',
  };

  const animationStyles = {
    shimmer:
      'relative overflow-hidden bg-slate-800/60 before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/5 before:to-transparent',
    pulse: 'animate-pulse bg-slate-800/70',
    none: 'bg-slate-800/50',
  };

  return (
    <div
      style={style}
      className={`shrink-0 ${variantStyles[variant]} ${animationStyles[animate]} ${className}`}
      {...props}
    />
  );
};

export default Skeleton;
