import { useCombine$ } from "./combine";
import { useSelect$ } from "./select";

import type { LucyState } from "../types";

function useReduce$<A, B, T>(
  items$: [A, B],
  selector: (items: [A, B]) => T
): LucyState<T>;
function useReduce$<A, B, C, T>(
  items$: [A, B, C],
  selector: (items: [A, B, C]) => T
): LucyState<T>;
function useReduce$<A, B, C, D, T>(
  items$: [A, B, C, D],
  selector: (items: [A, B, C, D]) => T
): LucyState<T>;
function useReduce$<A, B, C, D, E, T>(
  items$: [A, B, C, D, E],
  selector: (items: [A, B, C, D, E]) => T
): LucyState<T>;
function useReduce$<A, B, C, D, E, F, T>(
  items$: [A, B, C, D, E, F],
  selector: (items: [A, B, C, D, E, F]) => T
): LucyState<T>;
function useReduce$<A, B, C, D, E, F, G, T>(
  items$: [A, B, C, D, E, F, G],
  selector: (items: [A, B, C, D, E, F, G]) => T
): LucyState<T>;
function useReduce$<A, B, C, D, E, F, G, H, T>(
  items$: [A, B, C, D, E, F, G, H],
  selector: (items: [A, B, C, D, E, F, G, H]) => T
): LucyState<T>;
function useReduce$<A, B, C, D, E, F, G, H, I, T>(
  items$: [A, B, C, D, E, F, G, H, I],
  selector: (items: [A, B, C, D, E, F, G, H, I]) => T
): LucyState<T>;
function useReduce$(items$, selector) {
  // @ts-expect-error
  const combinedState$ = useCombine$(...items$);
  const selectedState$ = useSelect$(combinedState$, selector);

  return selectedState$;
}

export { useReduce$ };
