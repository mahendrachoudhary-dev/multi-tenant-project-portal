import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    api("/auth/me", { signal: controller.signal })
      .then((data) => {
        if (!controller.signal.aborted) setUser(data.user);
      })
      .catch((err) => {
        if (!controller.signal.aborted && err.status !== 401) setError(err);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    const expire = () => setUser(null);
    window.addEventListener("session-expired", expire);
    return () => {
      controller.abort();
      window.removeEventListener("session-expired", expire);
    };
  }, [attempt]);

  const signIn = async (mode, body) => {
    const data = await api(`/auth/${mode}`, { method: "POST", body });
    setUser(data.user);
  };
  const signOut = async () => {
    await api("/auth/logout", { method: "POST", body: {} });
    setUser(null);
  };
  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        retry: () => setAttempt((a) => a + 1),
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
