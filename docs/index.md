---
title: Getting Started
layout: home
nav_order: 1
---

# What is React-Lucy-State

React-Lucy-State is an experimental library which provides an alternative primitive for state in React components. Instead of using `useState()`, you'd use `useLucyState()`, and instead of getting a plain value, you get a wrapped one, with methods which allow

This library is not aimed to replace any of the state management libraries, like [Redux](https://redux.js.org/) or [Zustand](https://github.com/pmndrs/zustand), but it should allow to subscribe to data updates from these libraries more efficiently (it also means you'll need to write your own hooks for them).

## Installation

You can install React-Lucy-State from npm:

```sh
npm i --save react-lucy-state
```

## Basic example

On the surface, it looks almost exactly like using regular `React.useState`. Let's build a simple counter application:

```jsx
import { useLucyState } from "react-lucy-state";

function Counter() {
  const [counter$, setCounter] = useLucyState(0);

  return (
    <div>
      <button onClick={() => setCounter((value) => value + 1)}>
        +
      </button>
      <p>
        current value is <counter$.Value />
      <p>
    </div>
  );
}
```

Despite having very similar syntax, there are a few core differences. First, `counter$` value is not a plain one, it is a stable object which won't change when the counter value is updated. Second, the component itself will not re-render when the counter value changes, only `<counter$.Value />` will get updated.

In this example, the difference will be negligible. The advantage of this approach is more pronounced when you have bigger components with multiple states and it is hard to properly isolate them into each component.

## Advanced example

Let's build a more advanced example. This time we'll build a list and break down all the things we get here.

```jsx
import { useLucyState, StableIteratorComponent } from "react-lucy-state";

const task1 = { id: 1, content: "first task" };
const task2 = { id: 2, content: "second task" };
const task3 = { id: 3, content: "third task" };
const task4 = { id: 4, content: "fourth task" };
function ListComponent() {
  const [tasks$] = useLucyState([task1, task2, task3, task4]);

  return (
    <div>
      <ul>
        <$tasks.Value>
          {(tasks) =>
            tasks.map((task, index) => (
              <StableIteratorComponent key={task.id} item={task} index={index}>
                {(task$, index$) => (
                  <ItemComponent task$={task$} index$={index$} />
                )}
              </StableIteratorComponent>
            ))
          }
        </$tasks.Value>
      </ul>
    </div>
  );
}

function TaskComponent({ task$, index$ }) {
  return (
    <li>
      <index$.Value />: <task$.Value selector={(task) => task.content} />
    </li>
  );
}
```

As you can see, we build a list of tasks and render them. In order to memoize each task, we wrap them in `<StableIteratorComponent>` which converts an item and the index to LucyState values. In this case, again, the difference between just wrapping `TaskComponent` with [React.memo](https://react.dev/reference/react/memo) will be non-existent. But there are differences:

1. `React.memo` will compare every passed prop, meanwhile `<StableIteratorComponent>` will only compare `item` and `index`. If you don't need the index, you can use `<StableItemComponent>` instead, and it will compare only one property, `item`.
2. If something changes, the memoized component will be fully re-rendered, while the version using LucyState will re-render only changed parts. Again, this will matter only for big and complicated components.
