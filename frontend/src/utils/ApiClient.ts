const API_BASE_URL: string =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  'http://localhost:4000';

const STORAGE_KEY: string = 'quiniela2026.token';

export const getStoredToken = (): string | null => {
  return window.localStorage.getItem(STORAGE_KEY);
};

export const setStoredToken = (token: string | null): void => {
  if (token === null) {
    window.localStorage.removeItem(STORAGE_KEY);
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, token);
};

export interface IApiError {
  status: number;
  message: string;
}

const buildHeaders = (hasBody: boolean): HeadersInit => {
  const headers: Record<string, string> = {};
  if (hasBody) {
    headers['Content-Type'] = 'application/json';
  }
  const token: string | null = getStoredToken();
  if (token !== null) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const parseResponse = async <T>(response: Response): Promise<T> => {
  const raw: unknown = await response.json().catch((): null => null);
  if (!response.ok) {
    const message: string =
      typeof raw === 'object' &&
      raw !== null &&
      'message' in raw &&
      typeof (raw as { message: unknown }).message === 'string'
        ? (raw as { message: string }).message
        : `Request failed with status ${response.status}`;
    const error: IApiError = { status: response.status, message };
    throw error;
  }
  return raw as T;
};

export const apiGet = async <T>(path: string): Promise<T> => {
  const response: Response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'GET',
    headers: buildHeaders(false)
  });
  return parseResponse<T>(response);
};

export const apiPost = async <T>(path: string, body: unknown): Promise<T> => {
  const response: Response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: buildHeaders(true),
    body: JSON.stringify(body)
  });
  return parseResponse<T>(response);
};

export const apiPut = async <T>(path: string, body: unknown): Promise<T> => {
  const response: Response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'PUT',
    headers: buildHeaders(true),
    body: JSON.stringify(body)
  });
  return parseResponse<T>(response);
};

export const apiPatch = async <T>(path: string, body: unknown): Promise<T> => {
  const response: Response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'PATCH',
    headers: buildHeaders(true),
    body: JSON.stringify(body)
  });
  return parseResponse<T>(response);
};
