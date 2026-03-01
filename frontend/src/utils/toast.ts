/**
 * Thin wrapper around sonner that keeps the same
 * { title, description } calling convention used across the app.
 */
import { toast as _toast } from 'sonner';

interface ToastOpts {
  title: string;
  description?: string;
  duration?: number;
  id?: string | number;
}

export const toast = {
  success: (opts: ToastOpts) =>
    _toast.success(opts.title, { description: opts.description, duration: opts.duration ?? 5000, id: opts.id }),
  error: (opts: ToastOpts) =>
    _toast.error(opts.title, { description: opts.description, duration: opts.duration ?? 5000, id: opts.id }),
  warning: (opts: ToastOpts) =>
    _toast.warning(opts.title, { description: opts.description, duration: opts.duration ?? 5000, id: opts.id }),
  info: (opts: ToastOpts) =>
    _toast.info(opts.title, { description: opts.description, duration: opts.duration ?? 5000, id: opts.id }),
  show: (opts: ToastOpts) =>
    _toast(opts.title, { description: opts.description, duration: opts.duration ?? 5000, id: opts.id }),
  dismiss: _toast.dismiss,
  promise: _toast.promise,
} as const;
