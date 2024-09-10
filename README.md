## React Lucy State

This library aims to provide a replacement for `React.useState` primitive which should allow to write more performant code. The library itself is a copy of the state approach from [Veles library](https://github.com/bloomca/veles) adapted to React.

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
      <SomeExpensiveComponent />
    </div>
  );
}
```

This example will work as you expect if you used regular `React.useState`, but `<MyComponent>` itself will never re-render. The only things which will re-render are:

- `<input />` on each update, and only because we need to update an attribute
- text node which shows the current value

That's it, nothing else will be updated. An important part is that `<SomeExpensiveComponent />` won't be re-rendered as well. While it is possible to avoid that re-render by either passing it as a child from a parent component, or exporting the input component into a separate one, with this approach you don't have to, which is increasingly more valuable with more complicated components.

## Advanced example

The basic example doesn't look too convincing; as I've described, it is not too hard to extract it to avoid most of the re-renders. Let's build something which is much harder to achieve on your own, a performant list of items:

```jsx
import { useLucyState, StableIteratorComponent } from "react-lucy-state";

const task1 = { id: 1, content: "first task" };
const task2 = { id: 2, content: "second task" };
const task3 = { id: 3, content: "third task" };
const task4 = { id: 4, content: "fourth task" };
function ListComponent() {
  const tasks$ = useLucyState([task1, task2, task3, task4]);

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

This examples introduces a lot of concepts. First, we can see that when we use `<tasks$.Value />` component, the callback is not "stable", meaning that it will be re-rendered every time the value inside changes. Usually that's what we want, if we go for smaller DOM changes, but in case of array, that'd be too wasteful (although this is what happens in normal React code).
So we wrap each item in `<StableIteratorComponent>`, which accepts `item` and `index`. Inside it wraps them into a Lucy state, and then _never re-renders_ (hence "stable").

The next concept is passing down Lucy state as a property. As I've mentioned, the state object itself will never change, meaning that even if the value does change, the component will not re-render. This means that when a task does change, not the whole component will be re-rendered.

Last concept is `selector` property on `<task$.Value />` component. This improves things even further by allowing you to subscribe to only parts of the object, or you can combine multiple properties; as long as you return a [primitive data type](https://developer.mozilla.org/en-US/docs/Glossary/Primitive), it won't be re-rendered unless it changes.

## DOM Attributes

DOM attributes are a major issue for React performance. Often you might need to dynamically assign a class based on some variable, but the DOM Node is somewhere in the middle of the component and can't be extracted easily. There is a not so elegant solution in this library:

```jsx
import {
  useLucyState,
  UnstableComponent,
  StableComponent,
  useSelect$,
} from "react-lucy-state";

function Component() {
  const [input$, setInput] = useLucyState("");
  // we check if the value contains only numbers
  const hasError$ = useSelect$(input$, (value) => !value.match(/^[0-9]+$/i));

  return (
    <div>
      <UnstableComponent items$={[hasError$]}>
        {([hasError]) => (
          <div className={hasError ? "error" : undefined}>
            <StableComponent>
              <Content hasError$={hasError$} />
            </StableComponent>
          </div>
        )}
      </UnstableComponent>

      <input$.Value>
        {(value) => (
          <input
            type="text"
            value={value}
            onChange={(e) => setInput(e.target.value)}
          />
        )}
      </input$.Value>
    </div>
  );
}
```

## Effects

LucyState provides a `useTrackValue` and `useTrackValueSelector` methods, which should work as a replacement for `React.useEffect` the vast majority of the time. As a simple example:

```jsx
import { useLucyState } from "react-lucy-state";

function Component() {
  const [counter$, setCounter] = useLucyState(0);

  counter$.useTrackValue((counterValue) => {
    console.log(`counter value is ${counterValue}`);
  });

  return (
    <div>
      <button onClick={() => setCounter((value) => value + 1)}>
        Increment counter
      </button>
    </div>
  );
}
```

Similar to `React.useEffect`, you can return a function, which will be executed when the value changes or the component unmounts. If you need to run a function which depends on multiple Lucy states, there is a helper `useCombine$`:

```jsx
import { useLucyState, useCombine$ } from "react-lucy-state";

function Component() {
  const [firstCounter$, setFirstCounter] = useLucyState(0);
  const [secondCounter$, setSecondCounter] = useLucyState(0);

  const combinedCounter$ = useCombine$(firstCounter$, secondCounter$);
  combinedCounter$.useTrackValue(([firstValue, secondValue]) => {
    console.log(`total counter value is ${firstValue + secondValue}`);
  });

  return (
    <div>
      <button onClick={() => setFirstCounter(firstCounter$.getValue() + 1)}>
        Increment first counter
      </button>
      <button onClick={() => setSecondCounter(secondCounter$.getValue() + 1)}>
        Increment second counter
      </button>
    </div>
  );
}
```

## Interoperability

You can switch back and forth between regular props and Lucy state, but you should be careful while doing so. First, you can convert a Lucy state into a regular React state property with `useConvertLucyStateToProperty` helper. Remember that by doing so, the whole component will re-render, including all its children. Here is an example:

```jsx
function Component() {
  const [value$, setValue] = useLucyState(0);

  return (
    <div>
      <button onClick={() => setValue((value) => value + 1)}>
        Increment value
      </button>
      <Content value$={value$} />
    </div>
  );
}

function Content({ value$ }: { value$: LucyState<number> }) {
  const value = useConvertLucyStateToProperty(value$);

  return <h2>Current value is {value}</h2>;
}
```

In this example, the whole `<Content />` component will re-render on each value change.

You can perform the same operation, but the other way. To do, just wrap a regular React variable in `useConvertToLucyState`, and you'll receive a stable Lucy state. Again, be careful and remember that just doing so won't change much, as having a regular variable means the whole component will re-render. So you'll probably want to wrap at least some children in a `<StableComponent />`. Here is a reverse example:

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
  useEffect(spy);

  return (
    <h2>
      Current value is <value$.Value />
    </h2>
  );
}
```

As you can see, we need to wrap `<Content />` in a stable component to make sure it doesn't re-render when the `value` changes.
