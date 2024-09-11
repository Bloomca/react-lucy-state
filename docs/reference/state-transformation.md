---
layout: default
title: Operations on Lucy States
nav_order: 2
parent: API
---

## Operations on Lucy States

Since states are not plain values, you'll need some extra helpers to perform operations on them. You can also write your own helpers; think of them as an extremely simple implementation of operations on observables.

### `useSelect$`

- `useSelect$(state$, (stateValue) => newStateValue, comparator?)`

Take a state, and transform it into another stream with modified values. An example:

```jsx
const [task$, setTask] = useLucyState({ id: 1, name: "task name" });
const taskName$ = useSelect$(task$, (task) => task.name);
```

You can see that we simply created another state based on the first one. Please keep in mind that you cannot change the value of this state directly, as you receive only the state value without the setter.

### `useReduce$`

- `useReduce$([state1$, state2$, ...], ([state1, state2, ...]) => newValue, comparator?)`

Take a list of states (any amount) and create a new state with the new value. Here is an example:

```jsx
const [value1$, setValue1] = useLucyState(0);
const [value2$, setValue2] = useLucyState(0);
const sum$ = useReduce$(
  [value1$, value2$],
  ([value1, value2]) => value1 + value2
);
```

We got a new state value which will be the sum of both states. Similar to `useSelect$`, you only get the state value back without setter.

### `useCombine$`

- `useCombine$(state1$, state2$, ....)`

Simply combine states, and return a new state which will have a value of all states in an array. Since `useReduce$` does the same, but also executed a callback on them, you probably would want to use it instead.
