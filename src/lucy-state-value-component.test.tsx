import { useEffect } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { useLucyState } from "./use-lucy-state";

describe("<state$.Value />", () => {
  it("renders the string value if no children are provided", async () => {
    const user = userEvent.setup();
    let newValue = "Updated value";
    function Component() {
      const state$ = useLucyState("Default value");

      return (
        <div>
          <h1>
            <state$.Value />
          </h1>
          <button onClick={() => state$.setValue(newValue)}>
            Change value
          </button>
        </div>
      );
    }

    render(<Component />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Default value"
    );

    await user.click(screen.getByRole("button", { name: "Change value" }));
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Updated value"
    );
  });

  it("renders the number value if no children are provided", async () => {
    const user = userEvent.setup();
    let newValue = 20;
    function Component() {
      const state$ = useLucyState(10);

      return (
        <div>
          <h1>
            State value is: <state$.Value />
          </h1>
          <button onClick={() => state$.setValue(newValue)}>
            Change value
          </button>
        </div>
      );
    }

    render(<Component />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "State value is: 10"
    );

    await user.click(screen.getByRole("button", { name: "Change value" }));
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "State value is: 20"
    );
  });

  it("executes child callback correctly", async () => {
    const user = userEvent.setup();
    let newValue = 15;
    function Component() {
      const state$ = useLucyState(5);

      return (
        <div>
          <state$.Value>
            {(value) => <h1>State value is: {value}</h1>}
          </state$.Value>

          <button onClick={() => state$.setValue(newValue)}>
            Change value
          </button>
        </div>
      );
    }

    render(<Component />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "State value is: 5"
    );

    await user.click(screen.getByRole("button", { name: "Change value" }));
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "State value is: 15"
    );
  });

  it("executes selector callback correctly", async () => {
    const user = userEvent.setup();
    let newValue = {
      value: 11,
      textValue: "New value",
    };
    function Component() {
      const state$ = useLucyState({
        value: 9,
        textValue: "Initial value",
      });

      return (
        <div>
          <state$.Value selector={(state) => state.value}>
            {(value) => <h1>State value is: {value}</h1>}
          </state$.Value>

          <button onClick={() => state$.setValue(newValue)}>
            Change value
          </button>
        </div>
      );
    }

    render(<Component />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "State value is: 9"
    );

    await user.click(screen.getByRole("button", { name: "Change value" }));
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "State value is: 11"
    );
  });

  it("executes child callback only when the selector result changes", async () => {
    const spy = jest.fn();
    const user = userEvent.setup();
    let newValue = {
      value: 5,
      textValue: "New value",
    };
    function Content({ value }: { value: number }) {
      useEffect(spy);

      return <h1>State value is: {value}</h1>;
    }
    function Component() {
      const state$ = useLucyState({
        value: 2,
        textValue: "Initial value",
      });

      return (
        <div>
          <state$.Value selector={(state) => state.value}>
            {(value) => <Content value={value} />}
          </state$.Value>

          <button onClick={() => state$.setValue(newValue)}>
            Change value
          </button>
        </div>
      );
    }

    render(<Component />);

    expect(spy).toHaveBeenCalledTimes(1);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "State value is: 2"
    );

    await user.click(screen.getByRole("button", { name: "Change value" }));
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "State value is: 5"
    );

    expect(spy).toHaveBeenCalledTimes(2);

    newValue = {
      value: 5,
      textValue: "something new",
    };

    await user.click(screen.getByRole("button", { name: "Change value" }));
    expect(spy).toHaveBeenCalledTimes(2);
  });
});
