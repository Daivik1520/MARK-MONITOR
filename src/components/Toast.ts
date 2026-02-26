/**
 * Toast notification system for Mark Monitor.
 * Provides stacked, auto-dismissing notifications with severity levels.
 */

export type ToastSeverity = 'info' | 'success' | 'warning' | 'error';

interface ToastOptions {
    message: string;
    severity?: ToastSeverity;
    duration?: number; // ms, 0 = sticky
    dismissible?: boolean;
}

interface ActiveToast {
    el: HTMLElement;
    timer: ReturnType<typeof setTimeout> | null;
}

const MAX_VISIBLE = 3;
const DEFAULT_DURATION = 4000;
const SEVERITY_ICONS: Record<ToastSeverity, string> = {
    info: 'ℹ',
    success: '✓',
    warning: '⚠',
    error: '✕',
};

let container: HTMLElement | null = null;
const activeToasts: ActiveToast[] = [];

function ensureContainer(): HTMLElement {
    if (container && document.body.contains(container)) return container;
    container = document.createElement('div');
    container.className = 'toast-container';
    container.setAttribute('aria-live', 'polite');
    container.setAttribute('aria-atomic', 'false');
    document.body.appendChild(container);
    return container;
}

function removeToast(toast: ActiveToast): void {
    toast.el.classList.add('toast-exiting');
    if (toast.timer) clearTimeout(toast.timer);
    setTimeout(() => {
        toast.el.remove();
        const idx = activeToasts.indexOf(toast);
        if (idx !== -1) activeToasts.splice(idx, 1);
    }, 250);
}

export function showToast(options: ToastOptions): void {
    const {
        message,
        severity = 'info',
        duration = DEFAULT_DURATION,
        dismissible = true,
    } = options;

    const cont = ensureContainer();

    // Remove oldest if at max
    while (activeToasts.length >= MAX_VISIBLE) {
        const oldest = activeToasts.shift();
        if (oldest) {
            if (oldest.timer) clearTimeout(oldest.timer);
            oldest.el.remove();
        }
    }

    const el = document.createElement('div');
    el.className = `toast toast-${severity}`;
    el.setAttribute('role', 'alert');
    el.innerHTML = `
    <span class="toast-icon">${SEVERITY_ICONS[severity]}</span>
    <span class="toast-msg">${message}</span>
    ${dismissible ? '<button class="toast-close" aria-label="Dismiss">×</button>' : ''}
  `;

    cont.appendChild(el);

    // Force reflow then animate in
    void el.offsetHeight;
    el.classList.add('toast-visible');

    const toast: ActiveToast = { el, timer: null };

    if (dismissible) {
        el.querySelector('.toast-close')?.addEventListener('click', () => removeToast(toast));
    }

    if (duration > 0) {
        toast.timer = setTimeout(() => removeToast(toast), duration);
    }

    activeToasts.push(toast);
}

/** Clear all active toasts */
export function clearAllToasts(): void {
    for (const toast of [...activeToasts]) {
        removeToast(toast);
    }
}
