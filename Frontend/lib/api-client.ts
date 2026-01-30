import { createClient } from './supabase-client'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
    const supabase = createClient();
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    console.log('DEBUG: Session check:', { hasSession: !!session, error: sessionError });

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers as Record<string, string>,
    };

    if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
        console.log('DEBUG: Token added to request');
    } else {
        console.warn('WARNING: No session token available. User might not be logged in.');
    }

    // Handle leading slash in endpoint
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const fullUrl = `${API_URL}${path}`;

    console.log('DEBUG: Making request to:', fullUrl);

    try {
        const response = await fetch(fullUrl, {
            ...options,
            headers,
        });

        console.log('DEBUG: Response status:', response.status);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('DEBUG: API Error:', errorData);
            throw new Error(errorData.message || 'API request failed');
        }

        return response.json();
    } catch (error) {
        console.error('DEBUG: Fetch error:', error);
        throw error;
    }
}
