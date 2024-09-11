---
layout: default
title: Stable Components
nav_order: 3
parent: API
---

## Stable Components

This library's main goal is to avoid full component re-renders as much as possible. By default, all state variables are "stable", meaning that they will never change. However, there are some situations where you'll use plain values and then you might want to use these helper components (e.g. if you render a list of items).

### `<StableComponent>`

`<StableComponent>` never re-renders their children, and doesn't accept any props. So how does it work? It renders them first time, so you need to either not pass any props to them, or pass only stable props, either constants or Lucy states. An example:

```jsx
import { useLucyState, StableComponent } from "react-lucy-state";

function Component({ propertyWhichWillChange }) {
  const [state$, setState] = useLucyState(initialState);

  return (
    <div>
      {propertyWhichWillChange}
      <StableComponent>
        <ExpensiveComponent state$={state$} />
      </StableComponent>
    </div>
  );
}
```

In this case, when `propertyWhichWillChange` changes, the `ExpensiveComponent` will not be re-rendered. Despite being very similar to [React.memo](https://react.dev/reference/react/memo) in idea, the difference is that there are no props comparison here.

### `<StableItemComponent>`

A component which accepts a single plain variable (`item`) and converts it into a Lucy state. After that it only updates the Lucy state in case the said prop changes, but never re-renders the child callback. This component will mostly be used in lists:

```jsx
import { StableItemComponent } from "react-lucy-state";

function Component() {
  const [tasks$, setTasks] = useLucyState(initialTasks);

  return (
    <div>
      <ul aria-label="tasks">
        <tasks$.Value>
          {(tasks) =>
            tasks.map((task) => (
              <StableItemComponent item={task} key={task.id}>
                {(task$) => <ItemComponent task$={task$} />}
              </StableItemComponent>
            ))
          }
        </tasks$.Value>
      </ul>
    </div>
  );
}
```

### `<StableIteratorComponent>`

A very similar component to the previous one, but now it also accepts the index value and passes it as a second argument to the children callback.

```jsx
function Component() {
  const [tasks$, setTasks] = useLucyState(initialTasks);

  return (
    <div>
      <ul aria-label="tasks">
        <tasks$.Value>
          {(tasks) =>
            tasks.map((task, index) => (
              <StableIteratorComponent item={task} index={index} key={task.id}>
                {(task$, index$) => (
                  <ItemComponent task$={task$} index={index$} />
                )}
              </StableIteratorComponent>
            ))
          }
        </tasks$.Value>
      </ul>
      <button onClick={() => setTasks(newTasks)}>Change tasks</button>
    </div>
  );
}
```
