import React from "react";

export type LucyState<T> = {
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
};
