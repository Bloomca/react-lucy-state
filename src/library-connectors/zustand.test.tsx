import { useEffect } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { createStore } from "zustand/vanilla";

import { useZustandHook } from "./zustand";
import { useLucyState } from "../use-lucy-state";

describe("useZustandHook", () => {
  it("subscribes to zustand updates correctly", async () => {
    const user = userEvent.setup();
    let newValue = "updated value";
    const zustandStore = createStore<{
      value: string;
      updateValue: () => void;
    }>((set) => ({
      value: "first value",
      updateValue() {
        set({ value: newValue });
      },
    }));

    function Component() {
      const zustand$ = useZustandHook({
        store: zustandStore,
        selector: (state) => state.value,
      });

      return (
        <div>
          <h2>
            Current value is: <zustand$.Value />
          </h2>
          <button onClick={() => zustandStore.getState().updateValue()}>
            Change value
          </button>
        </div>
      );
    }

    render(<Component />);

    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "Current value is: first value"
    );

    await user.click(screen.getByRole("button", { name: "Change value" }));

    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "Current value is: updated value"
    );

    newValue = "another value";

    await user.click(screen.getByRole("button", { name: "Change value" }));

    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "Current value is: another value"
    );
  });

  it("does not re-render components if the value has not changed", async () => {
    const spy = jest.fn();
    const user = userEvent.setup();
    let newValue = "updated value";
    let newNum = 25;
    const zustandStore = createStore<{
      value: string;
      num: number;
      updateValue: () => void;
      updateNum: () => void;
    }>((set) => ({
      value: "first value",
      num: 10,
      updateValue() {
        set({ value: newValue });
      },
      updateNum() {
        set({ num: newNum });
      },
    }));

    function Content({ value }: { value: string }) {
      useEffect(spy);

      return <h2>Current value is: {value}</h2>;
    }

    function Component() {
      const zustand$ = useZustandHook({
        store: zustandStore,
        selector: (state) => state.value,
      });
      const num$ = useZustandHook({
        store: zustandStore,
        selector: (state) => state.num,
      });

      return (
        <div>
          <zustand$.Value>
            {(value) => <Content value={value} />}
          </zustand$.Value>
          <h3>
            Current num is: <num$.Value />
          </h3>
          <button onClick={() => zustandStore.getState().updateValue()}>
            Change value
          </button>
          <button onClick={() => zustandStore.getState().updateNum()}>
            Change num
          </button>
        </div>
      );
    }

    render(<Component />);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "Current value is: first value"
    );
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(
      "Current num is: 10"
    );

    await user.click(screen.getByRole("button", { name: "Change num" }));

    expect(spy).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "Current value is: first value"
    );
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(
      "Current num is: 25"
    );

    await user.click(screen.getByRole("button", { name: "Change value" }));

    expect(spy).toHaveBeenCalledTimes(2);
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "Current value is: updated value"
    );
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(
      "Current num is: 25"
    );
  });

  it("re-renders when the dependency changes", async () => {
    const user = userEvent.setup();
    let newValue = {
      first: "updated first value",
      second: "updated second value",
    };
    let newSelection = "second";
    const zustandStore = createStore<{
      value: {
        first: string;
        second: string;
      };
      updateValue: () => void;
    }>((set) => ({
      value: {
        first: "first value",
        second: "second value",
      },
      updateValue() {
        set({ value: newValue });
      },
    }));

    function Component() {
      const [select$, setSelection] = useLucyState("first");
      const zustand$ = useZustandHook({
        store: zustandStore,
        selector: (state, [selection]) => state.value[selection],
        dependencies$: [select$],
      });

      return (
        <div>
          <h2>
            Current value is: <zustand$.Value />
          </h2>
          <button onClick={() => setSelection(newSelection)}>
            Change selection
          </button>
          <button onClick={() => zustandStore.getState().updateValue()}>
            Change value
          </button>
        </div>
      );
    }

    render(<Component />);

    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "Current value is: first value"
    );

    await user.click(screen.getByRole("button", { name: "Change selection" }));

    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "Current value is: second value"
    );

    await user.click(screen.getByRole("button", { name: "Change value" }));

    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "Current value is: updated second value"
    );

    newSelection = "first";
    await user.click(screen.getByRole("button", { name: "Change selection" }));

    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "Current value is: updated first value"
    );
  });
});
