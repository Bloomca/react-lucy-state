import { useEffect } from "react";
import { useCreateLucyState } from "./use-create-lucy-state";

// this function is a helper, and while it does help to convert to the
// same data structure, it won't give you performance benefits,
// because it will cause cascade re-renders
export function useConvertToLucyState<T>(property: T) {
  const state = useCreateLucyState(property);

  useEffect(() => {
    state.setValue(property);
  }, [property, state]);

  return state;
}
