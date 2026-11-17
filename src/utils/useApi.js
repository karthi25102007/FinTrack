import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client';

export function useApiData(url, config = {}) {
  const key = typeof url === 'string' ? url : JSON.stringify(url);
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const [tick, setTick] = useState(0);

  const load = useCallback(() => {
    let active = true;
    setState((current) => ({ ...current, loading: true, error: null }));
    api.get(url, config)
      .then((response) => active && setState({ data: response.data, loading: false, error: null }))
      .catch((error) => active && setState({ data: null, loading: false, error }));
    return () => { active = false; };
  }, [key, tick]);

  useEffect(() => load(), [load]);

  return {
    ...state,
    reload: useCallback(() => setTick((value) => value + 1), []),
    setData: useCallback((data) => setState((current) => ({ ...current, data })), []),
  };
}
