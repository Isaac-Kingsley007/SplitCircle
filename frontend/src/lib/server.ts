
const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:3000/api';

export async function get(url: string): Promise<any> {
    const res = await fetch(`${baseUrl}${url}`, {
        method: 'GET',
        credentials: 'include',
    });

    const json = await res.json();
    return json;
}

export async function post(url: string, body: any): Promise<any> {
    const res = await fetch(`${baseUrl}${url}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });

    const json = await res.json();
    return json;
}

export async function patch(url: string, body: any): Promise<any> {
    const res = await fetch(`${baseUrl}${url}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });

    return res.json();
}

export async function del (url: string): Promise<any> {
    const res = await fetch(`${baseUrl}${url}`, {
        method: 'DELETE',
        credentials: 'include',
    });

    return res.json();
}