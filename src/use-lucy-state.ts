import { useRef, useEffect } from "react";
import { useCreateLucyState } from "./use-create-lucy-state";

export function useLucyState<T>(
  initialValue: T,
  subscribeCallback?: (setValue: (newValue: T) => void) => Function
) {
  // this ref is created one time and is never changed
  // ideally, we'd want to execute the function only one time
  // but for now it's okay
  const lucyStateRef = useRef(useCreateLucyState(initialValue));

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
