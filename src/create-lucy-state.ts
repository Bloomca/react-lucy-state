import React, { useState, useEffect, useRef, memo } from "react";

import type { LucyState } from "../src/types";

const noValueSymbol = Symbol("no value");

export function createLucyState<T>(
  initialValue: T | (() => T),
  comparator?: (a: T, b: T) => boolean
): LucyState<T> {
  let value =
    // @ts-expect-error
    typeof initialValue === "function" ? initialValue() : initialValue;
  let subscriptions: Function[] = [];

  function LucyValueComponent<F = T>({
    selector = (value) => value as unknown as F,
    children,
  }: {
    selector?: (value: T) => F;
    children?: (value: F) => React.ReactNode;
  }) {
    const [state, setState] = useState(() => selector(value));
    useEffect(() => {
      const subscription = (newValue: T) => {
        setState(selector(newValue));
      };
      subscriptions.push(subscription);

      return () => {
        subscriptions = subscriptions.filter((cb) => cb !== subscription);
      };
    }, []);

    return children ? children(state) : (state as unknown as React.ReactNode);
  }

  function useTrackValue<F>(
    selector: (value: T) => F | undefined,
    cb: (value: F) => void | Function,
    {
      skipFirstCall,
      comparator,
    }: { skipFirstCall?: boolean; comparator?: (a: F, b: F) => boolean } = {}
  ) {
    const dataRef = useRef<{
      lastValue: typeof noValueSymbol | F;
      initialized: boolean;
      comparator: undefined | ((a: F, b: F) => boolean);
      unsubscribe: undefined | Function;
    }>({
      lastValue: noValueSymbol,
      initialized: false,
      comparator,
      unsubscribe: undefined,
    });

    if (!dataRef.current.initialized) {
      dataRef.current.initialized = true;

      if (!skipFirstCall) {
        const selectedValue = selector
          ? selector(value)
          : (value as unknown as F);
        const unsubscribe = cb(selectedValue);
        dataRef.current.lastValue = selectedValue;
        dataRef.current.unsubscribe = unsubscribe || undefined;
      }
    }

    useEffect(() => {
      const subscription = (newValue: T) => {
        const newSelectedValue = selector
          ? selector(newValue)
          : (newValue as unknown as F);
        const lastSelectedValue = dataRef.current.lastValue;

        if (
          !comparator ||
          lastSelectedValue === noValueSymbol ||
          !comparator(lastSelectedValue, newSelectedValue)
        ) {
          const unsubscribe = cb(newSelectedValue);
          dataRef.current.lastValue = newSelectedValue;
          if (dataRef.current.unsubscribe) {
            dataRef.current.unsubscribe();
          }
          dataRef.current.unsubscribe = unsubscribe || undefined;
        }
      };
      subscriptions.push(subscription);

      return () => {
        subscriptions = subscriptions.filter((cb) => cb !== subscription);
      };
    }, []);

    useEffect(() => {
      return () => {
        const unsubscribe = dataRef.current.unsubscribe;
        if (unsubscribe) unsubscribe();
      };
    }, []);
  }

  return {
    // read the current value; helpful to read the latest value in callbacks/event handlers
    getValue: () => value,
    setValue: (passedNewValue: T | ((currentValue: T) => T)) => {
      const newValue =
        typeof passedNewValue === "function"
          ? // @ts-expect-error
            passedNewValue(value)
          : passedNewValue;
      if (comparator) {
        // don't rerun subscriptions if comparator says they are the same
        if (comparator(value, newValue)) return;
        value = newValue;
      } else {
        // small optimization to avoid running subscriptions
        // if the referential equality is preserved
        if (value === newValue) return;
        value = newValue;
      }

      subscriptions.forEach((cb) => cb(newValue));
    },
    Value: LucyValueComponent,
    useTrackValue: (
      cb: (value: T) => void | Function,
      options: {
        skipFirstCall?: boolean;
        comparator?: (a: T, b: T) => boolean;
      }
    ) => {
      useTrackValue<T>(undefined, cb, options);
    },
    useTrackValueSelector<F>(
      selector: (value: T) => F,
      cb: (value: F) => void | Function,
      options: {
        skipFirstCall?: boolean;
        comparator?: (a: F, b: F) => boolean;
      } = {}
    ) {
      useTrackValue<F>(selector, cb, options);
    },
    trackValue(cb: (value: T) => void | Function) {
      const subscription = (newValue: T) => {
        cb(newValue);
      };
      subscriptions.push(subscription);

      return () => {
        subscriptions = subscriptions.filter((cb) => cb !== subscription);
      };
    },
  };
}

export function useConvertToLucyState<T>(property: T) {
  const state = createLucyState(property);

  useEffect(() => {
    state.setValue(property);
  }, [property, state]);

  return state;
}
