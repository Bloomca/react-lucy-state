import { useLucyState } from "../use-lucy-state";

type State<StateType> = ReturnType<typeof useLucyState<StateType>>;

function useSelect$<F, T>(
  state: State<F>,
  selector: (state: F) => T
): State<T> {
  const newState = useLucyState(() => selector(state.getValue()));
  state.useTrackValueSelector(
    selector,
    (selectedState) => {
      newState.setValue(selectedState);
    },
    { skipFirstCall: true }
  );

  return newState;
}

export { useSelect$ };
