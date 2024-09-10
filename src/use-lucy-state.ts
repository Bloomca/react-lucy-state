import { useRef } from "react";
import { createLucyState } from "./create-lucy-state";

type createdState<StateType> = ReturnType<typeof createLucyState<StateType>>;

export function useLucyState<T>(
  initialValue: T | (() => T),
  comparator?: (a: T, b: T) => boolean
) {
  const initStateRef = useRef<null | createdState<T>>(null);

  // we make sure we initialize the state only one time, microoptimization
  if (initStateRef.current === null) {
    initStateRef.current = createLucyState(initialValue, comparator);
  }

  return initStateRef.current;
}
