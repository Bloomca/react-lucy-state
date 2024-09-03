import { useStore } from "react-redux";
import { useEffect } from "react";
import { useLucyState } from "../use-lucy-state";

export function useReduxHook<T, F>(selector: (state: T) => F) {
  const store = useStore<T>();
  const state = useLucyState(selector(store.getState()));

  useEffect(() => {
    const unsbuscribe = store.subscribe(() => {
      const newValue = selector(store.getState());
      state.setValue(newValue);
    });

    return unsbuscribe;
  }, [store, state]);

  return state;
}
