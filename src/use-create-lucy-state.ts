import { useState, createElement, useEffect, useRef } from "react";

const noValueSymbol = Symbol("no value");

export function useCreateLucyState<T>(initialValue: T) {
  let value = initialValue;
  let subscriptions: Function[] = [];
  return {
    // read the current value; helpful to read the latest value in callbacks/event handlers
    getValue: () => value,
    setValue: (newValue: T) => {
      // small optimization to avoid running subscriptions
      // if the referential equality is preserved
      if (value === newValue) return;
      value = newValue;

      subscriptions.forEach((cb) => cb(newValue));
    },
    renderValue: (cb) => {
      return createElement(function LucyElement() {
        const [state, setState] = useState(value);
        useEffect(() => {
          const subscription = (newValue: T) => {
            setState(newValue);
          };
          subscriptions.push(subscription);

          return () => {
            subscriptions = subscriptions.filter((cb) => cb !== subscription);
          };
        }, []);

        return cb(state);
      });
    },
    renderValueSelector<F>(selector: (value: T) => F, cb) {
      return createElement(function LucyElement() {
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

        return cb(state);
      });
    },
    useTrackValue: (
      cb,
      { skipFirstCall }: { skipFirstCall?: boolean } = {}
    ) => {
      useEffect(() => {
        const subscription = (newValue: T) => {
          cb(newValue);
        };
        subscriptions.push(subscription);

        if (!skipFirstCall) {
          cb(value);
        }

        return () => {
          subscriptions = subscriptions.filter((cb) => cb !== subscription);
        };
      }, []);
    },
    useTrackValueSelector<F>(
      selector: (value: T) => F,
      cb,
      {
        skipFirstCall,
        comparator,
      }: { skipFirstCall?: boolean; comparator?: (a: F, b: F) => boolean } = {}
    ) {
      const dataRef = useRef<{
        lastValue: typeof noValueSymbol | F;
        initialized: boolean;
        comparator: undefined | ((a: F, b: F) => boolean);
      }>({
        lastValue: noValueSymbol,
        initialized: false,
        comparator,
      });

      if (!dataRef.current.initialized) {
        dataRef.current.initialized = true;

        if (!skipFirstCall) {
          const selectedValue = selector(value);
          cb(selectedValue);
          dataRef.current.lastValue = selectedValue;
        }
      }

      useEffect(() => {
        const subscription = (newValue: T) => {
          const newSelectedValue = selector(newValue);
          const lastSelectedValue = dataRef.current.lastValue;

          if (
            !comparator ||
            lastSelectedValue === noValueSymbol ||
            !comparator(lastSelectedValue, newSelectedValue)
          ) {
            cb(newSelectedValue);
            dataRef.current.lastValue = newSelectedValue;
          }
        };
        subscriptions.push(subscription);

        return () => {
          subscriptions = subscriptions.filter((cb) => cb !== subscription);
        };
      }, []);
    },
  };
}
