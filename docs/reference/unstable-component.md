---
layout: default
title: UnstableComponent
nav_order: 4
parent: API
---

## Unstable Component

Similar to Stable components which transform regular props to Lucy states, we might want to do it the other way. There are ways to do so right in the component body, but that would cause the entire component to re-render when the property changes. To avoid situations where we need to split components into several and create children in a component which won't re-render (a useful technique to avoid re-renders), there is an `<UnstableComponent>`.

There are 2 main reasons to use it:

1. pass properties to 3rd party components
2. set DOM attributes

Let's show the first example. Let's say I have a component `<Menu>` which receives a regular prop `isOpen`, but I only have `isOpen$` Lucy state passed down. So the markup will look like this:

```jsx
<div>
  <UnstableComponent items$={[isOpen$]}>
    {([isOpen]) => (
      <Menu isOpen={isOpen}>
        <MenuItems />
      </Menu>
    )}
  </UnstableComponent>
</div>
```

In this example, the menu contents will re-render every time `isOpen` changes, which probably is what we want anyway: the component will likely unmount when the menu is not open.

Now, let's look at another example, this time we have a classnames property `classnames$` and `label$`:

```jsx
<div>
  <UnstableComponent items$={[classnames$, label$]}>
    {([classnames, label]) => (
      <ul className={classnames} aria-label={label}>
        <StableComponent>
          <ListContents />
        </StableComponent>
      </ul>
    )}
  </UnstableComponent>
</div>
```

In case both `classnames$` and `label$` change a lot, we _might_ want to wrap the contents in `<StableComponent />` to avoid re-renders every time these values change.
