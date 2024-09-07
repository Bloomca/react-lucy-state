import { useEffect, useState, useRef } from "react";
import type { LucyState } from "../types";

function useLucyEffect<A>(
  cb: (values: [A]) => (() => void) | void,
  dependencies$: [LucyState<A>]
): void;
function useLucyEffect<A, B>(
  cb: (values: [A, B]) => (() => void) | void,
  dependencies$: [LucyState<A>, LucyState<B>]
): void;
function useLucyEffect<A, B, C>(
  cb: (values: [A, B, C]) => (() => void) | void,
  dependencies$: [LucyState<A>, LucyState<B>, LucyState<C>]
): void;
function useLucyEffect<A, B, C, D>(
  cb: (values: [A, B, C, D]) => (() => void) | void,
  dependencies$: [LucyState<A>, LucyState<B>, LucyState<C>, LucyState<D>]
): void;
function useLucyEffect<A, B, C, D, E>(
  cb: (values: [A, B, C, D, E]) => (() => void) | void,
  dependencies$: [
    LucyState<A>,
    LucyState<B>,
    LucyState<C>,
    LucyState<D>,
    LucyState<E>
  ]
): void;
function useLucyEffect<A, B, C, D, E, F>(
  cb: (values: [A, B, C, D, E, F]) => (() => void) | void,
  dependencies$: [
    LucyState<A>,
    LucyState<B>,
    LucyState<C>,
    LucyState<D>,
    LucyState<E>,
    LucyState<F>
  ]
): void;
function useLucyEffect<A, B, C, D, E, F, G>(
  cb: (values: [A, B, C, D, E, F, G]) => (() => void) | void,
  dependencies$: [
    LucyState<A>,
    LucyState<B>,
    LucyState<C>,
    LucyState<D>,
    LucyState<E>,
    LucyState<F>,
    LucyState<G>
  ]
): void;
function useLucyEffect<A, B, C, D, E, F, G, H>(
  cb: (values: [A, B, C, D, E, F, G, H]) => (() => void) | void,
  dependencies$: [
    LucyState<A>,
    LucyState<B>,
    LucyState<C>,
    LucyState<D>,
    LucyState<E>,
    LucyState<F>,
    LucyState<G>,
    LucyState<H>
  ]
): void;
function useLucyEffect(cb, dependencies$) {
  const [state, setState] = useState(
    () => transformState$(dependencies$) as any
  );

  useEffect(() => {
    const unsubscribe = cb(state);

    if (unsubscribe) {
      return unsubscribe;
    }
  }, [state]);

  const itemsRef = useRef(dependencies$);
  const updateStateRef = useRef(null);
  if (!updateStateRef.current) {
    updateStateRef.current = () => {
      setState(transformState$(itemsRef.current) as any);
    };
  }

  const unsubscribeRef = useRef<null | (() => void)>(null);

  // to ensure we run the updates function only one time
  // in case this component re-renders
  if (unsubscribeRef.current === null) {
    unsubscribeRef.current = subscribeToUpdates(dependencies$, () => {
      updateStateRef.current();
    });
  }

  useEffect(() => {
    if (!areArraysEqual(dependencies$, itemsRef.current)) {
      itemsRef.current = dependencies$;
      updateStateRef.current();

      if (unsubscribeRef.current) unsubscribeRef.current();

      unsubscribeRef.current = subscribeToUpdates(dependencies$, () => {
        updateStateRef.current();
      });
    }
  }, [dependencies$]);

  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) unsubscribeRef.current();
    };
  }, []);
}

function transformState$(items$: undefined | LucyState<any>[]) {
  if (!items$) return [];
  return items$.map((item$) => item$.getValue());
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

export { useLucyEffect };
