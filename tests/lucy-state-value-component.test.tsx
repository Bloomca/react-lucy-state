import { useEffect } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { useLucyState } from "../src/use-lucy-state";

describe("<state$.Value />", () => {
  it("renders the string value if no children are provided", async () => {
    const user = userEvent.setup();
    let newValue = "Updated value";
    function Component() {
      const [state$, setState] = useLucyState("Default value");

      return (
        <div>
          <h1>
            <state$.Value />
          </h1>
          <button onClick={() => setState(newValue)}>Change value</button>
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
      const [state$, setState] = useLucyState(10);

      return (
        <div>
          <h1>
            State value is: <state$.Value />
          </h1>
          <button onClick={() => setState(newValue)}>Change value</button>
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
      const [state$, setState] = useLucyState(5);

      return (
        <div>
          <state$.Value>
            {(value) => <h1>State value is: {value}</h1>}
          </state$.Value>

          <button onClick={() => setState(newValue)}>Change value</button>
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
      const [state$, setState] = useLucyState({
        value: 9,
        textValue: "Initial value",
      });

      return (
        <div>
          <state$.Value selector={(state) => state.value}>
            {(value) => <h1>State value is: {value}</h1>}
          </state$.Value>

          <button onClick={() => setState(newValue)}>Change value</button>
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
      const [state$, setState] = useLucyState({
        value: 2,
        textValue: "Initial value",
      });

      return (
        <div>
          <state$.Value selector={(state) => state.value}>
            {(value) => <Content value={value} />}
          </state$.Value>

          <button onClick={() => setState(newValue)}>Change value</button>
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

  it("works with input components as expected", async () => {
    const user = userEvent.setup();
    function Component() {
      const [value$, setValue] = useLucyState("");

      return (
        <div>
          <value$.Value>
            {(value) => (
              <input
                type="text"
                aria-label="valueInput"
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
            )}
          </value$.Value>
          <h3>
            Current value is: <value$.Value />
          </h3>
        </div>
      );
    }

    render(<Component />);

    await user.type(
      screen.getByRole("textbox", { name: "valueInput" }),
      "text"
    );

    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(
      "Current value is: text"
    );

    await user.type(
      screen.getByRole("textbox", { name: "valueInput" }),
      " and more text"
    );

    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(
      "Current value is: text and more text"
    );
  });
});
