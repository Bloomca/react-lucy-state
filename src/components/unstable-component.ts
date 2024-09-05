import { useRef, useState, useEffect } from "react";

import type { LucyState } from "../types";
import type { ReactNode } from "react";

export function UnstableComponent<A, B, C, D, E, F>(
  props:
    | {
        items$: [LucyState<A>];
        children: (value: [A, B, C, D, E, F]) => ReactNode;
      }
    | {
        items$: [LucyState<A>, LucyState<B>];
        children: (value: [A, B, C, D, E, F]) => ReactNode;
      }
    | {
        items$: [LucyState<A>, LucyState<B>, LucyState<C>];
        children: (value: [A, B, C, D, E, F]) => ReactNode;
      }
    | {
        items$: [LucyState<A>, LucyState<B>, LucyState<C>, LucyState<D>];
        children: (value: [A, B, C, D, E, F]) => ReactNode;
      }
    | {
        items$: [
          LucyState<A>,
          LucyState<B>,
          LucyState<C>,
          LucyState<D>,
          LucyState<E>
        ];
        children: (value: [A, B, C, D, E, F]) => ReactNode;
      }
    | {
        items$: [
          LucyState<A>,
          LucyState<B>,
          LucyState<C>,
          LucyState<D>,
          LucyState<E>,
          LucyState<F>
        ];
        children: (value: [A, B, C, D, E, F]) => ReactNode;
      }
): ReactNode;
export function UnstableComponent({ items$, children }) {
  const [items, setItems] = useState(() => transformState$(items$));
  const itemsRef = useRef(items$);
  const unsubscribeRef = useRef<null | (() => void)>(null);

  // to ensure we run the updates function only one time
  // in case this component re-renders
  if (!unsubscribeRef.current) {
    unsubscribeRef.current = subscribeToUpdates(items$, () => {
      setItems(transformState$(items$));
    });
  }

  useEffect(() => {
    if (!areArraysEqual(items$, itemsRef.current)) {
      setItems(transformState$(items$));
      itemsRef.current = items$;

      if (unsubscribeRef.current) unsubscribeRef.current();

      unsubscribeRef.current = subscribeToUpdates(items$, () => {
        setItems(transformState$(items$));
      });
    }
  }, [items$, setItems]);

  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) unsubscribeRef.current();
    };
  }, []);

  return children(items);
}

function areArraysEqual(array1: any[], array2: any[]) {
  if (array1.length !== array2.length) return false;

  for (let i = 0; i < array1.length; i++) {
    if (array1[i] !== array2[i]) return false;
  }

  return true;
}

function transformState$(items$: LucyState<any>[]) {
  return items$.map((item$) => item$.getValue());
}

function subscribeToUpdates(items$: LucyState<any>[], onChange: () => void) {
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
