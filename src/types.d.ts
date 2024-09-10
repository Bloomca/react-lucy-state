import React from "react";

export type LucyState<T> = {
  getValue: () => T;
  Value: <F = T>({
    selector,
    children,
  }: {
    selector?: (value: T) => F;
    children?: (value: F) => React.ReactNode;
  }) => React.ReactNode;
  useTrackValue: (
    cb: (value: T) => void | Function,
    options?: {
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
  trackValue(cb: (value: T) => void | Function): () => void;
};

export function SetState<T>(newValue: T | ((currentValue: T) => T)): void;

export type LucyRef<T> = [LucyState<T>, typeof SetState<T>];
