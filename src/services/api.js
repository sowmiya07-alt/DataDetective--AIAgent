/**
 * Centralized API client configured for future FastAPI integration.
 * Gracefully falls back to local client-side analysis when backend is unavailable.
 */

export const DEFAULT_API_URL = 'http://localhost:8000/api';

export function getApiBaseUrl() {
  return localStorage.getItem('datadetective_api_url') || 
         import.meta.env.VITE_API_BASE_URL || 
         DEFAULT_API_URL;
}

export function setApiBaseUrl(url) {
  if (url) {
    localStorage.setItem('datadetective_api_url', url.trim());
  } else {
    localStorage.removeItem('datadetective_api_url');
  }
}

/**
 * Check if the FastAPI backend is running
 */
export async function checkBackendHealth() {
  const baseUrl = getApiBaseUrl();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2000);

  try {
    const res = await fetch(`${baseUrl}/health`, {
      method: 'GET',
      signal: controller.signal,
      headers: { 'Accept': 'application/json' }
    });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      return { connected: true, status: 'Connected', url: baseUrl, details: data };
    }
    return { connected: false, status: 'Unreachable (HTTP error)', url: baseUrl };
  } catch (err) {
    clearTimeout(timeoutId);
    return { 
      connected: false, 
      status: 'Demo Mode (FastAPI backend not detected)', 
      url: baseUrl, 
      error: err.name === 'AbortError' ? 'Connection timed out' : err.message 
    };
  }
}

/**
 * Generic Fetch wrapper with timeout and JSON handling
 */
export async function apiFetch(endpoint, options = {}) {
  const baseUrl = getApiBaseUrl();
  const controller = new AbortController();
  const timeoutMs = options.timeout || 10000;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(options.headers || {})
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Server responded with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error(`Request to ${url} timed out after ${timeoutMs}ms`);
    }
    throw error;
  }
}
