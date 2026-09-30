import { useCallback, useEffect, useState } from "react";
import { api } from "../services/api";

export function useResource(path) {
  const [version, setVersion] = useState(0);
  const [state, setState] = useState({
    key: null,
    data: null,
    error: null,
    loading: true,
  });
  const key = `${path}:${version}`;
  useEffect(() => {
    const controller = new AbortController();
    if (!path) {
      setState({ key, data: null, error: null, loading: false });
      return () => controller.abort();
    }
    setState({ key, data: null, error: null, loading: true });
    api(path, { signal: controller.signal })
      .then((data) => {
        if (!controller.signal.aborted)
          setState({ key, data, error: null, loading: false });
      })
      .catch((error) => {
        if (!controller.signal.aborted)
          setState({ key, data: null, error, loading: false });
      });
    return () => controller.abort();
  }, [path, key]);
  const reload = useCallback(() => setVersion((v) => v + 1), []);
  // Never render an earlier tenant's result while a new effect is being started.
  return {
    ...(state.key === key ? state : { data: null, error: null, loading: true }),
    reload,
  };
}
