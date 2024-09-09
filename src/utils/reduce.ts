import { useCombine$ } from "./combine";
import { useSelect$ } from "./select";

import type { LucyState } from "../types";

function useReduce$<A, B, T>(
  items$: [LucyState<A>, LucyState<B>],
  selector: (items: [A, B]) => T,
  comparator?: (previousSelectedState: T, nextSelectedState: T) => boolean
): LucyState<T>;
function useReduce$<A, B, C, T>(
  items$: [LucyState<A>, LucyState<B>, LucyState<C>],
  selector: (items: [A, B, C]) => T,
  comparator?: (previousSelectedState: T, nextSelectedState: T) => boolean
): LucyState<T>;
function useReduce$<A, B, C, D, T>(
  items$: [LucyState<A>, LucyState<B>, LucyState<C>, LucyState<D>],
  selector: (items: [A, B, C, D]) => T,
  comparator?: (previousSelectedState: T, nextSelectedState: T) => boolean
): LucyState<T>;
function useReduce$<A, B, C, D, E, T>(
  items$: [
    LucyState<A>,
    LucyState<B>,
    LucyState<C>,
    LucyState<D>,
    LucyState<E>
  ],
  selector: (items: [A, B, C, D, E]) => T,
  comparator?: (previousSelectedState: T, nextSelectedState: T) => boolean
): LucyState<T>;
function useReduce$<A, B, C, D, E, F, T>(
  items$: [
    LucyState<A>,
    LucyState<B>,
    LucyState<C>,
    LucyState<D>,
    LucyState<E>,
    LucyState<F>
  ],
  selector: (items: [A, B, C, D, E, F]) => T,
  comparator?: (previousSelectedState: T, nextSelectedState: T) => boolean
): LucyState<T>;
function useReduce$<A, B, C, D, E, F, G, T>(
  items$: [
    LucyState<A>,
    LucyState<B>,
    LucyState<C>,
    LucyState<D>,
    LucyState<E>,
    LucyState<F>,
    LucyState<G>
  ],
  selector: (items: [A, B, C, D, E, F, G]) => T,
  comparator?: (previousSelectedState: T, nextSelectedState: T) => boolean
): LucyState<T>;
function useReduce$<A, B, C, D, E, F, G, H, T>(
  items$: [
    LucyState<A>,
    LucyState<B>,
    LucyState<C>,
    LucyState<D>,
    LucyState<E>,
    LucyState<F>,
    LucyState<G>,
    LucyState<H>
  ],
  selector: (items: [A, B, C, D, E, F, G, H]) => T,
  comparator?: (previousSelectedState: T, nextSelectedState: T) => boolean
): LucyState<T>;
function useReduce$<A, B, C, D, E, F, G, H, I, T>(
  items$: [
    LucyState<A>,
    LucyState<B>,
    LucyState<C>,
    LucyState<D>,
    LucyState<E>,
    LucyState<F>,
    LucyState<G>,
    LucyState<H>,
    LucyState<I>
  ],
  selector: (items: [A, B, C, D, E, F, G, H, I]) => T,
  comparator?: (previousSelectedState: T, nextSelectedState: T) => boolean
): LucyState<T>;
function useReduce$(items$, selector, comparator) {
  // @ts-expect-error
  const combinedState$ = useCombine$(...items$);
  const selectedState$ = useSelect$(combinedState$, selector, comparator);

  return selectedState$;
}

export { useReduce$ };
