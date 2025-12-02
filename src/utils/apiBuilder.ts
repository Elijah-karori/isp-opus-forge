/**
 * Utility functions for building API requests and coordinating JSON payloads
 */

/**
 * Build query string from object
 */
export function buildQueryString(params: Record<string, any>): string {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            if (Array.isArray(value)) {
                value.forEach(v => queryParams.append(key, String(v)));
            } else {
                queryParams.append(key, String(value));
            }
        }
    });

    const queryString = queryParams.toString();
    return queryString ? `?${queryString}` : '';
}

/**
 * Clean undefined/null values from object for API requests
 */
export function cleanPayload<T extends Record<string, any>>(payload: T): Partial<T> {
    const cleaned: Partial<T> = {};

    Object.entries(payload).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            cleaned[key as keyof T] = value;
        }
    });

    return cleaned;
}

/**
 * Convert form data to API-compatible format
 */
export function formDataToJson(formData: FormData): Record<string, any> {
    const json: Record<string, any> = {};

    formData.forEach((value, key) => {
        if (json[key]) {
            // If key already exists, convert to array
            if (Array.isArray(json[key])) {
                json[key].push(value);
            } else {
                json[key] = [json[key], value];
            }
        } else {
            json[key] = value;
        }
    });

    return json;
}

/**
 * Build API request configuration
 */
export interface ApiRequestConfig {
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    endpoint: string;
    params?: Record<string, any>;
    body?: Record<string, any>;
    headers?: Record<string, string>;
}

export function buildApiRequest(config: ApiRequestConfig): {
    url: string;
    init: RequestInit;
} {
    const { method, endpoint, params, body, headers } = config;

    const url = endpoint + (params ? buildQueryString(params) : '');

    const init: RequestInit = {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...headers,
        },
    };

    if (body && method !== 'GET') {
        init.body = JSON.stringify(cleanPayload(body));
    }

    return { url, init };
}

/**
 * Coordinate multiple API calls
 */
export async function coordinateApiCalls<T>(
    calls: Array<() => Promise<T>>
): Promise<T[]> {
    return Promise.all(calls.map(call => call()));
}

/**
 * Coordinate sequential API calls
 */
export async function coordinateSequentialCalls<T>(
    calls: Array<() => Promise<T>>
): Promise<T[]> {
    const results: T[] = [];

    for (const call of calls) {
        results.push(await call());
    }

    return results;
}

/**
 * Batch API requests with delay
 */
export async function batchApiRequests<T>(
    requests: Array<() => Promise<T>>,
    batchSize: number = 5,
    delayMs: number = 100
): Promise<T[]> {
    const results: T[] = [];

    for (let i = 0; i < requests.length; i += batchSize) {
        const batch = requests.slice(i, i + batchSize);
        const batchResults = await Promise.all(batch.map(req => req()));
        results.push(...batchResults);

        // Delay between batches except for the last one
        if (i + batchSize < requests.length) {
            await new Promise(resolve => setTimeout(resolve, delayMs));
        }
    }

    return results;
}
