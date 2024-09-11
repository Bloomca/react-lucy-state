---
layout: default
title: useLucyState
nav_order: 1
parent: API
---

## useLucyState

This is the main function of this library, a hook to create Lucy states. Similar to React, it returns a tuple with the state and the setter function.

## Reference

- `useLucyState(initialValue, comparator?)`
- `useLucyState(() => initialValue, comparator?)`

Returns a tuple of the state and the setter: `[state$, setState]`. We'll look into the state in detail in the next section, and the setter accepts either a new variable, or a function which will be executed with the current value as its first parameter and returns the new state.

> Note: the returned value is stable, meaning that it doesn't change when the component re-renders

## LucyState reference

The returned `state$` object has following methods:

### `state$.getValue()`

Get current value synchronously. Mostly useful in callbacks, where you don't need to subscribe to updates.

### `<state$.Value>`

A React component to render state changes. If you render it without any props, it will render the latest value directly; if you provide a selector but no children, it will render the selected value directly, and if you provide a function as a child, it will provide the latest value. Let's see an example how it all comes together:

```jsx
import { useLucyState } from "react-lucy-state";

function Component() {
  const [state$] = useLucyState({ id: 1, name: "Example name" });

  return (
    <div>
      <state$.Value selector={(state) => state.name}>
        {(name) => `name: ${name}`}
      </state$.Value>
    </div>
  );
}
```

### `state$.useTrackValue`

A replacement for `React.useEffect`. Since the state value is stable, you can't just listen to it, and therefore this replacement is needed. Here is an example:

```jsx
import { useLucyState } from "react-lucy-state";

function Component() {
  const [counter$, setCounter] = useLucyState(0);

  counter$.useTrackValue((value) => {
    console.log(`counter value is ${value}`);
  });

  return (
    <div>
      <button onClick={() => setCounter((value) => value + 1)}>
        Increment
      </button>
    </div>
  );
}
```
