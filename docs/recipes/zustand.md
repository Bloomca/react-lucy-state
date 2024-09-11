---
layout: default
title: Using with Zustand
nav_order: 3
parent: Recipes
---

[Zustand](https://github.com/pmndrs/zustand) is a simple state management library, borrowing some principles from Redux. Similar to Redux, you'd need to write your own hook, and here is a basic example to get you started:

```ts
import type { UseBoundStore, StoreApi } from "zustand";

export function useZustand$<T, F>(
  store: UseBoundStore<StoreApi<T>> | StoreApi<T>,
  selector: (state: T) => F
) {
  const [state$, setState] = useLucyState(() => selector(store.getState()));

  useEffect(() => {
    const unsbuscribe = store.subscribe((currentState) => {
      const newValue = selector(currentState);
      setState(newValue);
    });

    return unsbuscribe;
    // should be okay to ignore selector
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store, setState]);

  return state$;
}
```

The implementation is very similar to the suggested Redux hook. Since you'll often use more than a single Zustand store in your application, the function accepts a store as its first parameter (you can create that store using both `zustand` and `zustand/vanilla`, no need to rewrite anything).

Same as the Redux implementation, it doesn't accept the dependencies, so you are advised to use `useReduce$` to select the exact results you need:

```js
const activeTaskId$ = useZustand$((state) => state.activeTaskId);
const isActiveTask$ = useReduce(
  [activeTaskId$, taskId$],
  ([activeTaskId, taskId]) => activeTaskId === taskId
);
```

The overhead should be minimal.
