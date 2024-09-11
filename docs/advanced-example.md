---
title: Advanced Example
layout: default
nav_order: 2
---

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
