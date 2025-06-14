'use client';

/**
 * Toast hook - wrapper around Sonner toast
 * Provides a consistent interface for toast notifications
 */

import * as React from 'react';
import { toast as sonnerToast } from 'sonner';

type ToastVariant = 'default' | 'destructive';

interface ToastProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  variant?: ToastVariant;
  action?: React.ReactNode;
  duration?: number;
}

/**
 * Custom toast hook that wraps Sonner toast
 * Provides a consistent interface for toast notifications
 */
function useToast() {
  const toast = ({ 
    title, 
    description, 
    variant = 'default',
    action,
    duration = 5000
  }: ToastProps) => {
    // Map our variants to Sonner options
    if (variant === 'destructive') {
      return sonnerToast.error(title as string, {
        description,
        action,
        duration,
      });
    }
    
    return sonnerToast(title as string, {
      description,
      action,
      duration,
    });
  };

  // Add additional toast types for convenience
  const success = (title: string, description?: string, duration = 3000) => {
    return sonnerToast.success(title, {
      description,
      duration,
    });
  };

  const error = (title: string, description?: string, duration = 5000) => {
    return sonnerToast.error(title, {
      description,
      duration,
    });
  };

  const info = (title: string, description?: string, duration = 4000) => {
    return sonnerToast.info(title, {
      description,
      duration,
    });
  };

  const warning = (title: string, description?: string, duration = 4000) => {
    return sonnerToast.warning(title, {
      description,
      duration,
    });
  };

  const dismiss = (toastId?: string) => {
    sonnerToast.dismiss(toastId);
  };

  return {
    toast,
    success,
    error,
    info,
    warning,
    dismiss
  };
}

// For direct usage without the hook
const toast = {
  default: (title: string, description?: string) => sonnerToast(title, { description }),
  success: (title: string, description?: string) => sonnerToast.success(title, { description }),
  error: (title: string, description?: string) => sonnerToast.error(title, { description }),
  info: (title: string, description?: string) => sonnerToast.info(title, { description }),
  warning: (title: string, description?: string) => sonnerToast.warning(title, { description }),
  dismiss: (toastId?: string) => sonnerToast.dismiss(toastId)
};

export { useToast, toast };
