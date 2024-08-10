import { useCreateLucyState } from "./use-create-lucy-state";

type State<StateType> = ReturnType<typeof useCreateLucyState<StateType>>;

function useSelect<F, T>(state: State<F>, selector: (state: F) => T): State<T> {
  const initialValue = selector(state.getValue());

  const newState = useCreateLucyState(initialValue);
  state.useTrackValueSelector(
    selector,
    (selectedState) => {
      newState.setValue(selectedState);
    },
    { skipFirstCall: true }
  );

  return newState;
}

export { useSelect };
