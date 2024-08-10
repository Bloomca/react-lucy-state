import { useRef, useEffect } from "react";
import { useCreateLucyState } from "./use-create-lucy-state";

type createdState<StateType> = ReturnType<typeof useCreateLucyState<StateType>>;

export function useLucyState<T>(
  initialValue: T,
  {
    subscribeCallback,
    comparator,
  }: {
    subscribeCallback?: (setValue: (newValue: T) => void) => Function;
    comparator?: (a: T, b: T) => boolean;
  } = {}
) {
  const initStateRef = useRef<null | createdState<T>>(null);

  // we make sure we initialize the state only one time, microoptimization
  if (initStateRef.current === null) {
    initStateRef.current = useCreateLucyState(initialValue, comparator);
  }

  const lucyStateRef = useRef(initStateRef.current);

  useEffect(() => {
    if (subscribeCallback) {
      const unsubscribe = subscribeCallback(lucyStateRef.current.setValue);

      return () => unsubscribe();
    }
    // ideally we'd want to have the callback which never changes
    // otherwise it will change on every re-render, which will cause constant
    // registering/de-registering
  }, [subscribeCallback]);

  return lucyStateRef.current;
}
