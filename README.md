## React Lucy State

![Tests status](https://github.com/bloomca/veles/actions/workflows/pull-request-workflow.yaml/badge.svg)
[![Version](https://img.shields.io/npm/v/react-lucy-state)](https://www.npmjs.com/package/react-lucy-state)

> This is a highly experimental library. You can use it today, but there is no extensive testing in big projects yet.

This library aims to provide a replacement for `React.useState` primitive which should allow to write more performant code. The library itself is a copy of the state approach from the [Veles library](https://github.com/bloomca/veles) adapted to React.

## Installation

The package is published on npm:

```sh
npm i --save react-lucy-state
```

## How it works

The main problem with React performance is that any state update within a component (or inside a hook you use within a component) will trigger a cascading re-render. Very rarely you want the whole component to re-render, which leads to wasteful building of VDOM and later comparison of render and calculated tree.

This library provides a stable state primitive which never changes, so when you update it, nothing will re-render. While this probably doesn't make sense on its own, it also provides a way to create components which will re-render when the value changes; but you don't need to put it into a separate component and usually you will go for a smallest possible DOM change.

## Basic example

Let's see a simple example, a value from input saved to a variable and reflected on the screen:

```jsx
import { useLucyState } from "react-lucy-state";

function MyComponent() {
  const [inputValue$, setInputValue] = useLucyState("");

  return (
    <div>
      <inputValue$.Value>
        {(value) => (
          <input
            type="text"
            value={value}
            onChange={(e) => setInputValue(e.target.value)}
          />
        )}
      </inputValue$.Value>
      <p>
        Current value is: <inputValue$.Value />
      </p>
      <SomeExpensiveComponent value$={inputValue$} />
    </div>
  );
}
```

This example will work as you expect if you used regular `React.useState`, but `<MyComponent>` itself will never re-render. The only things which will re-render are:

- `<input />` on each update, and only because we need to update an attribute
- text node which shows the current value

That's it, nothing else will be updated. An important part is that `<SomeExpensiveComponent />` won't be re-rendered as well, and only if the `value$` is used somewhere to render content, that part will be re-rendered on changes (but not the whole component). If it is used for stuff like hooks, it won't cause any re-renders at all.

## Additional resources

- [Advanced example](https://bloomca.github.io/react-lucy-state/advanced-example)
- [API docs](https://bloomca.github.io/react-lucy-state/reference/)
- [Guides](https://bloomca.github.io/react-lucy-state/recipes/)

## When can it be useful?

This library aims to simplify performance optimization of very complicated components. If you receive a lot of props and execute a lot of hooks (and it is not easy to isolate them in their own components as well) and the performance solution becomes very brittle, this library should provide a stable foundation where you can minimize the re-rendering effects relatively easily.

The state primitive also allows for multiple mapping of the state with custom comparators on each step, which _potentially_ can make some data transformations more performant (in "pure" React you need to rely on `useMemo` which recalculates each time a dependency changes, which can be limiting).

That being said, if you have a relatively simple application where the number of passed props is very little and not a lot of custom hooks are involved, you are probably better off with following the best practices and memoizing expensive components, the results should be very similar.

## Does it work?

In theory, yes. I added tests for each scenario where we'd have additional re-renders without the library, but I haven't tested it in a big application (where it should give the most benefits).
