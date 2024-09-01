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
