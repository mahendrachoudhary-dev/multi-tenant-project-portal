const base = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");

export async function api(path, { method = "GET", body, signal } = {}) {
  let response;
  try {
    response = await fetch(`${base}${path}`, {
      method,
      credentials: "include",
      signal,
      headers: { "Content-Type": "application/json", "X-Portal-Request": "1" },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new Error(
      "Cannot reach the server. Check your connection and try again.",
    );
  }
  
  const data =
    response.status === 204 ? null : await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 && !path.startsWith("/auth/"))
      window.dispatchEvent(new Event("session-expired"));
    const error = new Error(
      data?.errors
        ?.map((e) => `${e.field || "Input"}: ${e.message}`)
        .join(" • ") ||
        data?.message ||
        "Request failed.",
    );
    error.status = response.status;
    throw error;
  }
  return data;
}

export const orgPath = (id) => `/organizations/${id}`;
