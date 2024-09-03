import { useEffect } from "react";
import { useLucyState } from "../use-lucy-state";

import type { UseBoundStore, StoreApi } from "zustand";

export function useZustandHook<T, F>(
  store: UseBoundStore<StoreApi<T>> | StoreApi<T>,
  selector: (state: T) => F
) {
  const state = useLucyState(selector(store.getState()));

  useEffect(() => {
    const unsbuscribe = store.subscribe((currentState) => {
      const newValue = selector(currentState);
      state.setValue(newValue);
    });

    return unsbuscribe;
  }, [store, state]);

  return state;
}
