
export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const headers = new Headers(options?.headers);

    if (options?.body instanceof URLSearchParams) {
        headers.set('Content-Type', 'application/x-www-form-urlencoded');
    } else if (options?.body instanceof FormData) {
        headers.delete('Content-Type');
    } else {
        if (!headers.has('Content-Type')) {
            headers.set('Content-Type', 'application/json');
        }
    }

    try {
        const res = await fetch(endpoint, {
            ...options,
            headers: headers,
        });

        if (!res.ok) {
            let errorDetails = '';
            try {
                const errorJson = await res.json();
                errorDetails = JSON.stringify(errorJson);
            } catch {
                errorDetails = await res.text();
            }
            throw new Error(`API 요청 실패: ${res.status} - ${errorDetails}`);
        }

        const data: T = await res.json();
        return data;
    } catch (error) {
        console.error(`fetchApi 에러:`, error);
        throw error;
    }
}