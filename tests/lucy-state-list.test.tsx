import { useEffect } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { StableIteratorComponent } from "../src/components/stable-iterator-component";
import { StableItemComponent } from "../src/components/stable-item-component";
import { useLucyState } from "../src/use-lucy-state";

import type { LucyState } from "../src/types";

type Task = { id: number; content: string };

describe("Lucy State lists", () => {
  it("only re-renders list items which changed", async () => {
    const user = userEvent.setup();
    const spy = jest.fn();
    const task1: Task = { id: 1, content: "First task" };
    const task2: Task = { id: 2, content: "Second task" };
    const task3: Task = { id: 3, content: "Third task" };
    const task4: Task = { id: 4, content: "Fourth task" };
    const task5: Task = { id: 5, content: "Fifth task" };
    let newTasks: Task[] = [];
    function ItemComponent({ task$ }: { task$: LucyState<Task> }) {
      useEffect(spy);

      return (
        <li>
          <task$.Value selector={(task) => task.content} />
        </li>
      );
    }
    function Component() {
      const [tasks$, setTasks] = useLucyState([
        task1,
        task2,
        task3,
        task4,
        task5,
      ]);

      return (
        <div>
          <ul aria-label="tasks">
            <tasks$.Value>
              {(tasks) =>
                tasks.map((task, index) => (
                  <StableIteratorComponent
                    item={task}
                    index={index}
                    key={task.id}
                  >
                    {(task$) => <ItemComponent task$={task$} />}
                  </StableIteratorComponent>
                ))
              }
            </tasks$.Value>
          </ul>
          <button onClick={() => setTasks(newTasks)}>Change tasks</button>
        </div>
      );
    }

    render(<Component />);

    expect(spy).toHaveBeenCalledTimes(5);

    newTasks = [
      task1,
      task2,
      { id: 3, content: "new task 3 content" },
      task4,
      task5,
    ];
    await user.click(screen.getByRole("button", { name: "Change tasks" }));

    // just checking that nothing remounted; the components are stable and won't re-render
    expect(spy).toHaveBeenCalledTimes(5);

    expect(screen.getByRole("list", { name: "tasks" })).toHaveTextContent(
      newTasks.map((task) => task.content).join("")
    );
  });

  it("only re-renders list items which changed when using <StableItemComponent />", async () => {
    const user = userEvent.setup();
    const spy = jest.fn();
    const task1: Task = { id: 1, content: "First task" };
    const task2: Task = { id: 2, content: "Second task" };
    const task3: Task = { id: 3, content: "Third task" };
    const task4: Task = { id: 4, content: "Fourth task" };
    const task5: Task = { id: 5, content: "Fifth task" };
    let newTasks: Task[] = [];
    function ItemComponent({ task$ }: { task$: LucyState<Task> }) {
      useEffect(spy);

      return (
        <li>
          <task$.Value selector={(task) => task.content} />
        </li>
      );
    }
    function Component() {
      const [tasks$, setTasks] = useLucyState([
        task1,
        task2,
        task3,
        task4,
        task5,
      ]);

      return (
        <div>
          <ul aria-label="tasks">
            <tasks$.Value>
              {(tasks) =>
                tasks.map((task) => (
                  <StableItemComponent item={task} key={task.id}>
                    {(task$) => <ItemComponent task$={task$} />}
                  </StableItemComponent>
                ))
              }
            </tasks$.Value>
          </ul>
          <button onClick={() => setTasks(newTasks)}>Change tasks</button>
        </div>
      );
    }

    render(<Component />);

    expect(spy).toHaveBeenCalledTimes(5);

    newTasks = [
      task1,
      task2,
      { id: 3, content: "new task 3 content" },
      task4,
      task5,
    ];
    await user.click(screen.getByRole("button", { name: "Change tasks" }));

    // just checking that nothing remounted; the components are stable and won't re-render
    expect(spy).toHaveBeenCalledTimes(5);

    expect(screen.getByRole("list", { name: "tasks" })).toHaveTextContent(
      newTasks.map((task) => task.content).join("")
    );
  });

  it("does not re-render existing list items when adding a new item", async () => {
    const user = userEvent.setup();
    const spy = jest.fn();
    const task1: Task = { id: 1, content: "First task" };
    const task2: Task = { id: 2, content: "Second task" };
    const task3: Task = { id: 3, content: "Third task" };
    const task4: Task = { id: 4, content: "Fourth task" };
    const task5: Task = { id: 5, content: "Fifth task" };
    let newTasks: Task[] = [];
    function ItemComponent({ task$ }: { task$: LucyState<Task> }) {
      useEffect(spy);

      return (
        <li>
          <task$.Value selector={(task) => task.content} />
        </li>
      );
    }
    function Component() {
      const [tasks$, setTasks] = useLucyState([
        task1,
        task2,
        task3,
        task4,
        task5,
      ]);

      return (
        <div>
          <ul aria-label="tasks">
            <tasks$.Value>
              {(tasks) =>
                tasks.map((task, index) => (
                  <StableIteratorComponent
                    item={task}
                    index={index}
                    key={task.id}
                  >
                    {(task$) => <ItemComponent task$={task$} />}
                  </StableIteratorComponent>
                ))
              }
            </tasks$.Value>
          </ul>
          <button onClick={() => setTasks(newTasks)}>Change tasks</button>
        </div>
      );
    }

    render(<Component />);

    expect(spy).toHaveBeenCalledTimes(5);

    newTasks = [
      task1,
      task2,
      task3,
      task4,
      task5,
      { id: 6, content: "Sixth task" },
    ];
    await user.click(screen.getByRole("button", { name: "Change tasks" }));

    expect(spy).toHaveBeenCalledTimes(6);

    expect(screen.getByRole("list", { name: "tasks" })).toHaveTextContent(
      newTasks.map((task) => task.content).join("")
    );
  });

  it("does update index correctly if it changes", async () => {
    const user = userEvent.setup();
    const spy = jest.fn();
    const task1: Task = { id: 1, content: "First task" };
    const task2: Task = { id: 2, content: "Second task" };
    const task3: Task = { id: 3, content: "Third task" };
    const task4: Task = { id: 4, content: "Fourth task" };
    const task5: Task = { id: 5, content: "Fifth task" };
    let newTasks: Task[] = [];
    function ItemComponent({
      task$,
      index$,
    }: {
      task$: LucyState<Task>;
      index$: LucyState<number>;
    }) {
      useEffect(spy);

      return (
        <li>
          <index$.Value />:
          <task$.Value selector={(task) => task.content} />
        </li>
      );
    }
    function Component() {
      const [tasks$, setTasks] = useLucyState([
        task1,
        task2,
        task3,
        task4,
        task5,
      ]);

      return (
        <div>
          <ul aria-label="tasks">
            <tasks$.Value>
              {(tasks) =>
                tasks.map((task, index) => (
                  <StableIteratorComponent
                    item={task}
                    index={index}
                    key={task.id}
                  >
                    {(task$, index$) => (
                      <ItemComponent task$={task$} index$={index$} />
                    )}
                  </StableIteratorComponent>
                ))
              }
            </tasks$.Value>
          </ul>
          <button onClick={() => setTasks(newTasks)}>Change tasks</button>
        </div>
      );
    }

    render(<Component />);

    expect(spy).toHaveBeenCalledTimes(5);

    newTasks = [task3, task1, task2, task5, task4];
    await user.click(screen.getByRole("button", { name: "Change tasks" }));

    expect(spy).toHaveBeenCalledTimes(5);

    expect(screen.getByRole("list", { name: "tasks" })).toHaveTextContent(
      newTasks.map((task, index) => `${index}:${task.content}`).join("")
    );
  });
});
