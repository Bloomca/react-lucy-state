---
layout: default
title: Efficient conditional checks
nav_order: 1
parent: Recipes
---

## Writing efficient condition checks

Since Lucy states are stable references, you'll need to be more precise at conditional checks. Consider this example:

```jsx
function Component({ task$ }) {
  return (
    <task$.Value>
      {(task) => (task ? <TaskComponent task$={task$} /> : null)}
    </task$.Value>
  );
}
```

This is a pretty common way to check if `task` exists, and render the `<TaskComponent />` conditionally. However, with this library it will not be optimal at all! This callback will be re-run every time the `task` reference changes, forcing the task component to re-render. However, we are not interested in changes in the `task` object itself, we are only interested whether it exists or not. So the correct way is to add a selector which will only check whether the object exists. We can accomplish this by using `selector` prop:

```jsx
function Component({ task$ }) {
  return (
    <task$.Value selector={(task) => Boolean(task)}>
      {(hasTask) => (hasTask ? <TaskComponent task$={task$} /> : null)}
    </task$.Value>
  );
}
```

You can see that `hasTask` will be a boolean, and in case `task` changes, the selector result won't change (it will remain `true`).

## Move all checks to the selector

Let's look at another example. Let's say we have a condition where we want to render some component only if there are 5 items, and we already have `itemsCount$`. Since the count is already a number, it might feel okay to check for it in the child callback, but it is the same situation:

```jsx
function Component({ itemsCount$ }) {
  return (
    <itemsCount$.Value>
      {(count) => (count > 5 ? <SomeComponent /> : null)}
    </itemsCount$.Value>
  );
}
```

As you already know, `<SomeComponent>` will re-render every time the count changes, but we are not interested in that. We are only interested whether it is more than 5 or not, so we can move this check to the `selector`:

```jsx
function Component({ itemsCount$ }) {
  return (
    <itemsCount$.Value selector={(count) => count > 5}>
      {(shouldShow) => (shouldShow ? <SomeComponent /> : null)}
    </itemsCount$.Value>
  );
}
```

As a rule of thumb, every time you have a conditional component, always return a boolean from a selector.
