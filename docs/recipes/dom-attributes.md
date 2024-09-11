---
layout: default
title: DOM attributes
nav_order: 4
parent: Recipes
---

## Setting DOM attributes

An ideal scenario with this library is that by using its state primitive, every component will never re-render on its own. However, even under the ideal scenario, you'll soon realize that it doesn't work for DOM attributes. Since you have to assign them directly in the markup, and they often wrap other components (e.g. you want to assign a class dynamically to the wrapper), all the components underneath will re-render. Moreover, if you want to assign several attributes, you might need to combine several states in the component body.

To help with that, you can use a combination of `<UnstableComponent>`/`<StableComponent>`. Let's say I have a `classname$` and `label$` states which I need to assign to a wrapper. To avoid re-rendering the component, I'll use them in the markup:

```jsx
<UnstableComponent items$={[classname$, label$]}>
  {([classname, label]) => {
    <main className={classname} arai-label={label}>
      <StableComponent>
        <MainContent />
      </StableComponent>
    </main>;
  }}
</UnstableComponent>
```

In this example, the only thing which will re-render will be the `<main>` tag. We memoize the `<MainContent />`, and while it is similar to wrapping it in `React.memo` when you pass no props, it is easier to do/undo compared to modifying the exported `<MainContent />` component, also the comparison check is simpler since it always returns `true`; with `React.memo` it will compare all passed props one by one.
