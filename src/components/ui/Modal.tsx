import React from 'react';
import { clsx } from 'clsx';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  footer?: React.ReactNode;
}

const sizeMap = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-2xl', xl: 'max-w-4xl' };

export function Modal({ open, onClose, title, children, size = 'md', footer }: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Modal card */}
      <div className={clsx(
        'relative w-full bg-white rounded-clay-lg shadow-clay-lg border border-clay-border animate-bounce-in z-10',
        sizeMap[size],
      )}>
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-clay-border">
            <h2 className="text-base sm:text-lg font-bold text-text-primary truncate mr-2">{title}</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-pill bg-clay-border-light text-text-secondary hover:bg-clay-border transition-colors duration-150 text-lg leading-none flex-shrink-0"
            >
              ×
            </button>
          </div>
        )}
        {/* Body */}
        <div className="px-4 sm:px-6 py-4 sm:py-5 overflow-y-auto max-h-[75vh]">
          {children}
        </div>
        {/* Footer */}
        {footer && (
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 px-4 sm:px-6 py-3.5 sm:py-4 border-t border-clay-border bg-off-white rounded-b-clay-lg">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
