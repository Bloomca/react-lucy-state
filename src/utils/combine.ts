import { useLucyState } from "../use-lucy-state";

import { LucyState } from "../types";

export function useCombine$<A, B>(
  state1: LucyState<A>,
  state2: LucyState<B>
): LucyState<[A, B]>;
export function useCombine$<A, B, C>(
  state1: LucyState<A>,
  state2: LucyState<B>,
  state3: LucyState<C>
): LucyState<[A, B, C]>;
export function useCombine$<A, B, C, D>(
  state1: LucyState<A>,
  state2: LucyState<B>,
  state3: LucyState<C>,
  state4: LucyState<D>
): LucyState<[A, B, C, D]>;
export function useCombine$<A, B, C, D, E>(
  state1: LucyState<A>,
  state2: LucyState<B>,
  state3: LucyState<C>,
  state4: LucyState<D>,
  state5: LucyState<E>
): LucyState<[A, B, C, D, E]>;
export function useCombine$<A, B, C, D, E, F>(
  state1: LucyState<A>,
  state2: LucyState<B>,
  state3: LucyState<C>,
  state4: LucyState<D>,
  state5: LucyState<E>,
  state6: LucyState<F>
): LucyState<[A, B, C, D, E, F]>;
export function useCombine$<A, B, C, D, E, F, G>(
  state1: LucyState<A>,
  state2: LucyState<B>,
  state3: LucyState<C>,
  state4: LucyState<D>,
  state5: LucyState<E>,
  state6: LucyState<F>,
  state7: LucyState<G>
): LucyState<[A, B, C, D, E, F, G]>;
export function useCombine$<A, B, C, D, E, F, G, H>(
  state1: LucyState<A>,
  state2: LucyState<B>,
  state3: LucyState<C>,
  state4: LucyState<D>,
  state5: LucyState<E>,
  state6: LucyState<F>,
  state7: LucyState<G>,
  state8: LucyState<H>
): LucyState<[A, B, C, D, E, F, G, H]>;
export function useCombine$<A, B, C, D, E, F, G, H, I>(
  state1: LucyState<A>,
  state2: LucyState<B>,
  state3: LucyState<C>,
  state4: LucyState<D>,
  state5: LucyState<E>,
  state6: LucyState<F>,
  state7: LucyState<G>,
  state8: LucyState<H>,
  state9: LucyState<I>
): LucyState<[A, B, C, D, E, F, G, H, I]>;
export function useCombine$<A, B, C, D, E, F, G, H, I, J>(
  state1: LucyState<A>,
  state2: LucyState<B>,
  state3: LucyState<C>,
  state4: LucyState<D>,
  state5: LucyState<E>,
  state6: LucyState<F>,
  state7: LucyState<G>,
  state8: LucyState<H>,
  state9: LucyState<I>,
  state10: LucyState<J>
): LucyState<[A, B, C, D, E, F, G, H, I, J]>;
export function useCombine$(...states) {
  const [combinedState$, setCombinedState] = useLucyState(() =>
    states.map((state) => state.getValue())
  );

  states.forEach((state) => {
    state.useTrackValue(
      () => {
        // by the time trackValue callback is called
        // it is guaranteed that reading `state.getValue` will
        // return the updated value
        const updatedValue = states.map((state) => state.getValue());
        setCombinedState(updatedValue);
      },
      { skipFirstCall: true }
    );
  });

  return combinedState$;
}
