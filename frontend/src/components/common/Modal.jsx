import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';

export default function Modal({ isOpen, onClose, title, subtitle, children, footer, size = 'md', dismissible = true }) {
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e) => e.key === 'Escape' && dismissible && onClose?.();
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose, dismissible]);

  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => dismissible && onClose?.()}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ opacity: 0, scale: 0.94, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 10 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              'relative z-10 w-full rounded-3xl bg-white border border-slate-100 shadow-2xl',
              sizes[size]
            )}
          >
            {(title || dismissible) && (
              <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
                <div>
                  {title && <h3 className="font-display text-lg font-bold text-slate-900">{title}</h3>}
                  {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
                </div>
                {dismissible && (
                  <button
                    onClick={onClose}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus-ring"
                    aria-label="Close dialog"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}
            <div className="max-h-[72vh] overflow-y-auto px-6 py-5">{children}</div>
            {footer && <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-6 py-4">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
