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
