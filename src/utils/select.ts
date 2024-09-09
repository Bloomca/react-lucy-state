import { useLucyState } from "../use-lucy-state";

type State<StateType> = ReturnType<typeof useLucyState<StateType>>;

function useSelect$<F, T>(
  state: State<F>,
  selector: (state: F) => T,
  comparator?: (previousSelectedState: T, nextSelectedState: T) => boolean
): State<T> {
  const newState = useLucyState(() => selector(state.getValue()));
  state.useTrackValueSelector(
    selector,
    (selectedState) => {
      newState.setValue(selectedState);
    },
    { skipFirstCall: true, comparator }
  );

  return newState;
}

export { useSelect$ };
