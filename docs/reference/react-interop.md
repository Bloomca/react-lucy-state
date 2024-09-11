---
layout: default
title: React Interop
nav_order: 5
parent: API
---

## Interaction with regular React props

In general, as long as you pass Lucy states around, you are "safe" against unnecessary re-renders. However, they do have drawbacks: you can't use them directly, you can't use default prop values with them, and you can't use various hooks (like [useLayoutEffect](https://react.dev/reference/react/useLayoutEffect)). Also, sometimes you'll receive regular values from 3rd party libraries. In order to navigate between them, you can convert them both ways.

### `useConvertLucyStateToProperty`

- `useConvertLucyStateToProperty(state$)`

Converts any Lucy state to a regular property; any time there is a new value, the property will be updated. Be very careful with this function, as it will cause re-renders of the component where it is called, so ideally you want it to be as localized as possible; for example, if you want to execute a hook, it would be good to pass all dependencies to a component which executes the said hook, but returns only `null`.

```jsx
import { useLucyState, useConvertLucyStateToProperty } from "react-lucy-state";
import { useLayoutEffect } from "react";

function Component() {
  const [value$, setValue] = useLucyState(0);

  return (
    <div>
      <button onClick={() => setValue((value) => value + 1)}>
        Increment value
      </button>
      <Effects value$={value$} />
    </div>
  );
}

function Effects({ value$ }: { value$: LucyState<number> }) {
  const value = useConvertLucyStateToProperty(value$);

  useLayoutEffect(() => {
    someOperation(value);
  }, [value]);

  return null;
}
```

### `useConvertToLucyState`

- `useConvertToLucyState(property)`

If you have a regular property but want to use it as a Lucy state, you can convert to it right in the component. The catch is that by itself, it won't give you any potential benefits, as the component will re-render every time the property changes. You can counter that by wrapping the markup with the `<StableComponent />`, but keep in mind that the execution of the component body might still be expensive.

```jsx
function Component({ value, onClick }) {
  const value$ = useConvertToLucyState(value);

  return (
    <div>
      <button onClick={onClick}>Increment value</button>
      <StableComponent>
        <Content value$={value$} />
      </StableComponent>
    </div>
  );
}

function Content({ value$ }: { value$: LucyState<number> }) {
  return (
    <h2>
      Current value is <value$.Value />
    </h2>
  );
}
```

You can see that in this example I do exactly this: wrap `<Content />` inside a stable component. In this specific scenario there would be practically no difference as the component is extremely simple, but in case it is an expensive markup tree, it can be worth it.
