import React, { useState, createElement, useEffect, useRef, memo } from "react";

const noValueSymbol = Symbol("no value");

type LucyState<T> = {
  getValue: () => T;
  setValue: (newValue: T) => void;
  Value: <F = T>({
    selector,
    children,
  }: {
    selector?: (value: T) => F;
    children: (value: F) => React.ReactNode;
  }) => React.ReactNode;
  renderValue: (
    cb: (value: T) => React.ReactNode,
    props?: Record<string, any>
  ) => React.FunctionComponentElement<{
    selector?: (value: T) => unknown;
    children: (value: unknown) => React.ReactNode;
  }>;
  renderValueSelector<F>(
    selector: (value: T) => F,
    cb: (value: F) => React.ReactNode,
    props?: Record<string, any>
  ): React.FunctionComponentElement<{
    selector?: (value: T) => unknown;
    children: (value: unknown) => React.ReactNode;
  }>;
  useTrackValue: (
    cb: (value: T) => void | Function,
    options: {
      skipFirstCall?: boolean;
      comparator?: (a: T, b: T) => boolean;
    }
  ) => void;
  useTrackValueSelector<F>(
    selector: (value: T) => F,
    cb: (value: F) => void | Function,
    options?: {
      skipFirstCall?: boolean;
      comparator?: (a: F, b: F) => boolean;
    }
  ): void;
  IteratingComponent<F>({
    item,
    index,
    children,
  }: {
    item: F;
    index: number;
    children: ({
      itemState,
      indexState,
    }: {
      itemState: LucyState<F>;
      indexState: LucyState<number>;
    }) => React.ReactNode;
  }): React.ReactElement;
};

export function useCreateLucyState<T>(
  initialValue: T,
  comparator?: (a: T, b: T) => boolean
): LucyState<T> {
  let value = initialValue;
  let subscriptions: Function[] = [];

  function LucyValueComponent<F = T>({
    selector = (value) => value as unknown as F,
    children,
  }: {
    selector?: (value: T) => F;
    children: (value: F) => React.ReactNode;
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

    return children(state);
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
    setValue: (newValue: T) => {
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
    renderValue: (
      cb: (value: T) => React.ReactNode,
      // this is for meta props, like `key` or `ref`
      props?: Record<string, any>
    ) => {
      return createElement(LucyValueComponent, {
        children: cb,
        ...props,
      });
    },
    renderValueSelector<F>(
      selector: (value: T) => F,
      cb: (value: F) => React.ReactNode,
      // this is for meta props, like `key` or `ref`
      props?: Record<string, any>
    ) {
      return createElement(LucyValueComponent, {
        children: cb,
        selector,
        ...props,
      });
    },
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
    /**
     * this is actually a potentially really powerful abstraction
     * but since we can't use hooks conditionally, to abstract it,
     * we'd need to use only `item`.
     * 
     * In theory that could work, pass an object as item, do a shallow
     * comparison by default, and inside a component do `useSelect` for
     * each property we are interested in.
     */
    IteratingComponent<F>({
      item,
      index,
      children,
    }: {
      item: F;
      index: number;
      children: ({
        itemState,
        indexState,
      }: {
        itemState: LucyState<F>;
        indexState: LucyState<number>;
      }) => React.ReactNode;
    }) {
      const itemState = useConvertToLucyState(item);
      const indexState = useConvertToLucyState(index);

      useEffect(() => {
        itemState.setValue(item);
      }, [item]);
      useEffect(() => {
        indexState.setValue(index);
      }, [index]);

      function InternalIteratingComponent({}: {
        itemState: LucyState<F>;
        indexState: LucyState<number>;
      }) {
        return children({ itemState, indexState });
      }

      // never re-render the memoized component
      const MemoizedIteratingComponent = memo(
        InternalIteratingComponent,
        () => true
      );

      return createElement(MemoizedIteratingComponent, {
        itemState,
        indexState,
      });
    },
  };
}

export function useConvertToLucyState<T>(property: T) {
  const state = useCreateLucyState(property);

  useEffect(() => {
    state.setValue(property);
  }, [property, state]);

  return state;
}
