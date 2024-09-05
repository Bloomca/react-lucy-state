import { useEffect } from "react";

import { render } from "@testing-library/react";
import { screen } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";

import { useLucyState } from "../src/use-lucy-state";

describe("useLucyState", () => {
  it("state works as expected", async () => {
    const user = userEvent.setup();
    function Component() {
      const state$ = useLucyState("Initial Value");
      return (
        <div>
          <h1>
            <state$.Value />
          </h1>
          <button onClick={() => state$.setValue("First Value")}>
            First button
          </button>
          <button onClick={() => state$.setValue("Second Value")}>
            Second button
          </button>
        </div>
      );
    }

    render(<Component />);

    expect(screen.getByRole("heading")).toHaveTextContent("Initial Value");
    await user.click(screen.getByRole("button", { name: "First button" }));
    expect(screen.getByRole("heading")).toHaveTextContent("First Value");
    await user.click(screen.getByRole("button", { name: "Second button" }));
    expect(screen.getByRole("heading")).toHaveTextContent("Second Value");
  });

  it("does not re-render the whole component", async () => {
    const spy = jest.fn();
    const user = userEvent.setup();
    function Component() {
      const state$ = useLucyState("Initial Value");
      useEffect(() => {
        spy();
      });
      return (
        <div>
          <h1>
            <state$.Value />
          </h1>
          <button onClick={() => state$.setValue("First Value")}>
            First button
          </button>
          <button onClick={() => state$.setValue("Second Value")}>
            Second button
          </button>
        </div>
      );
    }

    render(<Component />);

    // technically this is not guaranteed. so maybe we can save the amount of renders
    // and at the end of the test compare them, the number should be the same,
    // that's what matters
    expect(spy).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole("button", { name: "First button" }));
    await user.click(screen.getByRole("button", { name: "Second button" }));

    expect(spy).toHaveBeenCalledTimes(1);
  });
});
