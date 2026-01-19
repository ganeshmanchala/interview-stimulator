// src/lib/auth.js
// Frontend authentication helper for Interview Simulator
// Handles Google sign-in and local token management.
// Consistent with AuthContext.jsx keys (token, user)

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

/**
 * Initialize frontend auth state (optional prefetch)
 * Currently a no-op for compatibility with App.jsx
 */
export async function initAuth(config = {}) {
  return;
}

/**
 * Redirects to /login where GoogleAuthButton is rendered.
 */
export async function loginWithRedirect() {
  window.location.href = "/login";
}

/**
 * Handle Google OAuth credential.
 * Sends the ID token to the backend for verification.
 * Backend must return { token, user }.
 */
export async function handleGoogleCredential(credentialResponse) {
  if (!credentialResponse || !credentialResponse.credential) {
    throw new Error("No Google credential found");
  }

  const id_token = credentialResponse.credential;

  const res = await fetch(`${API_BASE}/api/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id_token }),
    credentials: "include",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Auth failed: ${res.status} ${text}`);
  }

  const data = await res.json();

  if (data.token) {
    try {
      // Store tokens consistently - use the same keys AuthProvider expects
      localStorage.setItem("token", data.token);
      localStorage.setItem("app_token", data.token); // For consistency
    } catch (e) {
      console.warn("Could not store token in localStorage", e);
    }
  }

  if (data.user) {
    try {
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("app_user", JSON.stringify(data.user)); // For consistency
    } catch (e) {
      console.warn("Could not store user in localStorage", e);
    }
  }

  return data;
}

// Update getLocalUser to check all possible keys
export function getLocalUser() {
  const keys = ["user", "app_user"];
  for (const key of keys) {
    const raw = localStorage.getItem(key);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        continue;
      }
    }
  }
  return null;
}

// Update getToken to check all possible keys
export function getToken() {
  const keys = ["token", "app_token"];
  for (const key of keys) {
    const token = localStorage.getItem(key);
    if (token) return token;
  }
  return null;
}
/**
 * Logs the user out by clearing localStorage.
 * Optionally notifies the backend if sessions are server-managed.
 */
export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  // Optional backend logout:
  // fetch(`${API_BASE}/api/auth/logout`, { method: 'POST', credentials: 'include' }).catch(() => {});
}

/**
 * Get locally stored user (synchronous)
 */
/**
 * Get user (async for compatibility with old usage)
 */
export async function getUser() {
  return getLocalUser();
}

/**
 * Get JWT token from localStorage
 */