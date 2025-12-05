import { API_BASE_URL } from "./config";

export async function apiFetch(
path: string,
options: RequestInit = {},
token?: string
) {
const url = `${API_BASE_URL}${path}`;

const headers: HeadersInit = {
"Content-Type": "application/json",
...(options.headers || {}),
};

if (token) {
(headers as Record<string, string>).Authorization = `Bearer ${token}`;
}

const res = await fetch(url, {
...options,
headers,
cache: "no-store",
});

const contentType = res.headers.get("content-type");
const isJson = contentType && contentType.includes("application/json");
const data = isJson ? await res.json() : null;

if (!res.ok) {
const message =
(data && (data.message || data.error)) ||
`Request failed with status ${res.status}`;
throw new Error(message);
}

return data;
}