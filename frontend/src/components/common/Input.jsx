import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/utils/cn';

const Input = forwardRef(function Input(
  { label, error, hint, icon: Icon, type = 'text', className, labelClassName, id, ...rest },
  ref
) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const resolvedType = isPassword && showPassword ? 'text' : type;
  const inputId = id || rest.name;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className={cn('mb-1.5 block text-sm font-medium text-slate-700', labelClassName)}>
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />}
        <input
          ref={ref}
          id={inputId}
          type={resolvedType}
          className={cn(
            'w-full rounded-xl border bg-white/80 px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 transition-colors focus-ring',
            Icon && 'pl-10',
            isPassword && 'pr-10',
            error ? 'border-danger focus-visible:ring-danger' : 'border-slate-200',
            className
          )}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
      {error ? (
        <p id={`${inputId}-error`} className="mt-1.5 text-xs font-medium text-danger">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-slate-400">{hint}</p>
      ) : null}
    </div>
  );
});

export default Input;
