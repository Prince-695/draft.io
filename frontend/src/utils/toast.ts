/**
 * Thin wrapper around gooey-toast that:
 * - Caps auto-dismiss at 5 s
 * - Adds a dismiss (✕) button to every toast
 */
import { toast as _toast, type ToastOptions } from 'gooey-toast';

const DURATION = 5000;

function withDismiss(opts: ToastOptions): ToastOptions {
  const id = opts.id ?? `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return {
    ...opts,
    id,
    duration: opts.duration ?? DURATION,
    button: opts.button ?? {
      title: '✕',
      onClick: () => _toast.dismiss(id),
    },
  };
}

export const toast = {
  show: (opts: ToastOptions) => _toast.show(withDismiss(opts)),
  success: (opts: ToastOptions) => _toast.success(withDismiss(opts)),
  error: (opts: ToastOptions) => _toast.error(withDismiss(opts)),
  warning: (opts: ToastOptions) => _toast.warning(withDismiss(opts)),
  info: (opts: ToastOptions) => _toast.info(withDismiss(opts)),
  action: (opts: ToastOptions) => _toast.action(withDismiss(opts)),
  dismiss: _toast.dismiss,
  clear: _toast.clear,
  promise: _toast.promise,
} as const;
