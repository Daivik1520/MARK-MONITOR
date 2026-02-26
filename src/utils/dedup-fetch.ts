/**
 * Request deduplication utility for Mark Monitor.
 * Prevents duplicate in-flight requests to the same URL.
 * If a request is already in-flight, returns the existing promise.
 */

const inflight = new Map<string, Promise<Response>>();

/**
 * Fetch with deduplication — concurrent calls to the same URL
 * return the same promise. Safe for GET requests only.
 */
export function dedupFetch(url: string, init?: RequestInit): Promise<Response> {
    // Only dedup GET requests (or no method = GET)
    const method = init?.method?.toUpperCase() ?? 'GET';
    if (method !== 'GET') {
        return fetch(url, init);
    }

    const existing = inflight.get(url);
    if (existing) return existing;

    const request = fetch(url, init).then(
        (response) => {
            inflight.delete(url);
            return response;
        },
        (error) => {
            inflight.delete(url);
            throw error;
        }
    );

    inflight.set(url, request);
    return request;
}

/** Returns the number of currently in-flight deduped requests */
export function getInflightCount(): number {
    return inflight.size;
}
