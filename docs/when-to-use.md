---
title: When to use
layout: default
nav_order: 5
---

This library is mostly aimed at simplifying performance optimization for complicated components, where you pass a lot of props and it is hard to decouple as a lot of them need to be used together. It can help to localize the impact of changes, and ideally even remove them altogether (e.g. if props are used only in hooks). If you for some reason need to construct often-changing props objects/arrays and need to pass them down and filter them down later, this library can help with that as well, since all the references are stable, and use can change the values and add a custom comparator to avoid re-renders.

Also if you have components with a lot of state, it can be rather brittle as one unoptimized hook/state can ruin the performance, and this library can make it more stable as updates will be localized.

In short, it is a complicated solution for rather complicated problems.
