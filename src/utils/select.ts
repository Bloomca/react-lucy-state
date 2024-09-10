import { useLucyState } from "../use-lucy-state";

import type { LucyState } from "../types";

function useSelect$<F, T>(
  state: LucyState<F>,
  selector: (state: F) => T,
  comparator?: (previousSelectedState: T, nextSelectedState: T) => boolean
): LucyState<T> {
  const [newState$, setNewState] = useLucyState(() =>
    selector(state.getValue())
  );
  state.useTrackValueSelector(
    selector,
    (selectedState) => {
      setNewState(selectedState);
    },
    { skipFirstCall: true, comparator }
  );

  return newState$;
}

export { useSelect$ };
