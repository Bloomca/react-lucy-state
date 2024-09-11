---
layout: default
title: Using with Redux
nav_order: 2
parent: Recipes
---

Because the idea behind this library is that you'll want most of your state to be in the form of Lucy states, regular hooks from [react-redux](https://react-redux.js.org/) won't work. You'd need to write your own; as of right now, there is no official hook, but you can start by using this one (this is a TypeScript version, feel free to remove types to get a regular JavaScript one):

```ts
export function useAppSelector$<T>(selector: (state: RootState) => T) {
  const store = useStore<RootState>();
  const [state$, setState] = useLucyState(() => selector(store.getState()));

  useEffect(() => {
    const unsbuscribe = store.subscribe(() => {
      const newValue = selector(store.getState());
      setState(newValue);
    });

    return unsbuscribe;
    // should be okay to ignore selector
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store, setState]);

  return state$;
}
```

You might notice that it doesn't work with additional parameters. While you can expand it to support, it gets a bit too complicated, and instead you can use `useReduce$`:

```ts
const tasks$ = useAppSelector$((state) => state.tasks);
const task$ = useReduce$([tasks$, taskId$], ([tasks, taskId]) => tasks[taskId]);
```

While it's true that `tasks$` can change pretty often, it doesn't matter because the component where you execute this code won't re-render because of this, and `task$` will change its value only when the referential equality check fails (so the actual task object was changed).
