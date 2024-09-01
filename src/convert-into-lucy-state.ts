import { useEffect, useState } from "react";
import { useLucyState } from "./use-lucy-state";

import type { LucyState } from "./types";

// this function is a helper, and while it does help to convert to the
// same data structure, it won't give you performance benefits,
// because it will cause cascade re-renders
export function useConvertToLucyState<T>(property: T) {
  const state = useLucyState(property);

  useEffect(() => {
    state.setValue(property);
  }, [property, state]);

  return state;
}

export function useConvertLucyStateToProperty<T>(lucyState: LucyState<T>) {
  const [state, setState] = useState(() => lucyState.getValue());

  lucyState.useTrackValue(
    (newValue) => {
      setState(newValue);
    },
    { skipFirstCall: true }
  );

  return state;
}
