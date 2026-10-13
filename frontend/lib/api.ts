export class ApiError extends Error {
    constructor(message: string, public status: number) {
        super(message);
    }
}

/** Backend se baat karne ka ek hi darwaza. Galti par saaf Hinglish message ke saath ApiError phenkta hai. */
export async function api<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
    let res: Response;
    try {
        res = await fetch(`/api${path}`, {
            method: init.method ?? "GET",
            headers: { "Content-Type": "application/json" },
            body: init.body === undefined ? undefined : JSON.stringify(init.body),
        });
    } catch {
        throw new ApiError("Server se jud nahi paa rahe. Internet ya server check karein.", 0);
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new ApiError((data as { error?: string }).error ?? "Kuch gadbad ho gayi.", res.status);
    return data as T;
}