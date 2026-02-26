/**
 * Environment variable validation for Mark Monitor.
 * Logs warnings for missing optional keys at startup.
 * Uses the toast system to show user-friendly messages.
 */

import { showToast } from '@/components/Toast';

interface EnvCheck {
    key: string;
    label: string;
    panels: string; // which panels are affected
}

const OPTIONAL_KEYS: EnvCheck[] = [
    { key: 'VITE_GROQ_API_KEY', label: 'Groq', panels: 'AI Insights' },
    { key: 'VITE_OPENROUTER_API_KEY', label: 'OpenRouter', panels: 'AI Synthesis' },
    { key: 'VITE_FINNHUB_API_KEY', label: 'Finnhub', panels: 'Markets, Commodities, Heatmap' },
    { key: 'VITE_CLOUDFLARE_API_TOKEN', label: 'Cloudflare', panels: 'Internet Outages' },
];

/**
 * Runs at startup to check which optional env vars are configured.
 * Shows a single summary toast if any are missing.
 */
export function checkEnvironment(): void {
    const missing: string[] = [];

    for (const check of OPTIONAL_KEYS) {
        const value = import.meta.env[check.key];
        if (!value || value === 'your_key_here' || value.trim() === '') {
            missing.push(check.label);
            console.info(`[env] ${check.label} (${check.key}) not configured — ${check.panels} panel(s) may be limited`);
        }
    }

    if (missing.length > 0 && missing.length < OPTIONAL_KEYS.length) {
        // Only show toast if SOME but not ALL are missing (all missing = fresh install, expected)
        showToast({
            message: `${missing.join(', ')} API key${missing.length > 1 ? 's' : ''} not configured — some panels may be limited`,
            severity: 'info',
            duration: 6000,
        });
    }
}
