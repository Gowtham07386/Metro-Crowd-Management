import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

const VARIANTS = {
  primary:
    'bg-gradient-to-r from-brand-600 to-brand-500 text-white hover:from-brand-700 hover:to-brand-600 shadow-lg shadow-brand-600/25',
  secondary:
    'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-sm',
  ghost: 'bg-transparent text-slate-600 hover:bg-slate-100',
  danger: 'bg-gradient-to-r from-rose-600 to-danger text-white hover:brightness-105 shadow-lg shadow-danger/25',
  signal: 'bg-gradient-to-r from-signal-500 to-signal-600 text-white hover:brightness-105 shadow-lg shadow-signal-500/25',
  glass: 'bg-white/15 text-white border border-white/25 backdrop-blur hover:bg-white/25',
};

const SIZES = {
  sm: 'text-xs px-3 py-1.5 gap-1.5 rounded-lg',
  md: 'text-sm px-4 py-2.5 gap-2 rounded-xl',
  lg: 'text-base px-6 py-3.5 gap-2 rounded-2xl',
};

const Button = forwardRef(function Button(
  {
    children,
    variant = 'primary',
    size = 'md',
    icon: Icon,
    iconPosition = 'left',
    isLoading = false,
    fullWidth = false,
    className,
    disabled,
    type = 'button',
    ...rest
  },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || isLoading}
      className={cn(
        'inline-flex items-center justify-center font-semibold transition-all duration-200 focus-ring disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]',
        VARIANTS[variant],
        SIZES[size],
        fullWidth && 'w-full',
        className
      )}
      {...rest}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        Icon && iconPosition === 'left' && <Icon className="h-4 w-4" />
      )}
      {children}
      {!isLoading && Icon && iconPosition === 'right' && <Icon className="h-4 w-4" />}
    </button>
  );
});

export default Button;
