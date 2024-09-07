import { useEffect, useRef } from "react";
import { useLucyState } from "../use-lucy-state";

import type { UseBoundStore, StoreApi } from "zustand";
import type { LucyState } from "../types";

export function useZustandHook<T, F, A, B, C>({
  store,
  selector,
  dependencies$,
}:
  | {
      store: UseBoundStore<StoreApi<T>> | StoreApi<T>;
      selector: (state: T, dependencies?: [A, B, C]) => F;
      dependencies$?: [LucyState<A>];
    }
  | {
      store: UseBoundStore<StoreApi<T>> | StoreApi<T>;
      selector: (state: T, dependencies?: [A, B, C]) => F;
      dependencies$?: [LucyState<A>, LucyState<B>];
    }
  | {
      store: UseBoundStore<StoreApi<T>> | StoreApi<T>;
      selector: (state: T, dependencies?: [A, B, C]) => F;
      dependencies$?: [LucyState<A>, LucyState<B>, LucyState<C>];
    }) {
  const firstValue = useRef<F | null>(null);
  if (firstValue.current === null) {
    firstValue.current = selector(
      store.getState(),
      transformState$(dependencies$) as any
    );
  }
  const state$ = useLucyState(firstValue.current);
  const itemsRef = useRef(dependencies$);

  const updateStateRef = useRef(null);
  if (!updateStateRef.current) {
    updateStateRef.current = (currentStoreState: T) => {
      const newValue = selector(
        currentStoreState,
        transformState$(itemsRef.current) as any
      );
      state$.setValue(newValue);
    };
  }

  const unsubscribeRef = useRef<null | (() => void)>(null);

  // to ensure we run the updates function only one time
  // in case this component re-renders
  if (unsubscribeRef.current === null) {
    unsubscribeRef.current = subscribeToUpdates(dependencies$, () => {
      updateStateRef.current(store.getState());
    });
  }

  useEffect(() => {
    const unsubscribe = store.subscribe((currentState) => {
      updateStateRef.current(currentState);
    });

    return unsubscribe;
  }, [store, state$]);

  useEffect(() => {
    if (!areArraysEqual(dependencies$, itemsRef.current)) {
      itemsRef.current = dependencies$;
      updateStateRef.current(store.getState());

      if (unsubscribeRef.current) unsubscribeRef.current();

      unsubscribeRef.current = subscribeToUpdates(dependencies$, () => {
        updateStateRef.current(store.getState());
      });
    }
  }, [dependencies$]);

  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) unsubscribeRef.current();
    };
  }, []);

  return state$;
}

function areArraysEqual(array1: any[] | undefined, array2: any[] | undefined) {
  // both are undefined
  if (!array1 && !array2) return true;
  // if one is undefined, but another is not, we need to recalculate
  if (!array1 && array2) return false;
  if (array1 && !array2) return false;
  if (array1.length !== array2.length) return false;

  for (let i = 0; i < array1.length; i++) {
    if (array1[i] !== array2[i]) return false;
  }

  return true;
}

function transformState$(items$: LucyState<any>[]) {
  if (!items$) return [];
  return items$.map((item$) => item$.getValue());
}

function subscribeToUpdates(
  items$: LucyState<any>[] | undefined,
  onChange: () => void
) {
  if (!items$) {
    return undefined;
  }

  const unsubscribeFns = [];
  items$.forEach((item$) => {
    const unsubscribe = item$.trackValue(() => {
      onChange();
    });

    unsubscribeFns.push(unsubscribe);
  });

  return () => {
    unsubscribeFns.forEach((fn) => fn());
  };
}
