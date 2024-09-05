import { useEffect } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { StableComponent, UnstableComponent, useLucyState } from "../src";

import type { LucyState } from "../src";

describe("Interop between <StableComponent> and <UnstableComponent>", () => {
  it("allows to update attributes without unnecessary re-renders", async () => {
    const user = userEvent.setup();
    const spy = jest.fn();
    const newValue = "newValue";
    function Content({ value$ }: { value$: LucyState<string> }) {
      useEffect(spy);
      return (
        <h2>
          <value$.Value />
        </h2>
      );
    }

    function Component() {
      const state$ = useLucyState("initialValue");

      return (
        <div>
          <button onClick={() => state$.setValue(newValue)}>
            Change value
          </button>
          <UnstableComponent items$={[state$]}>
            {([value]) => (
              <div aria-label={value}>
                <StableComponent>
                  <Content value$={state$} />
                </StableComponent>
              </div>
            )}
          </UnstableComponent>
        </div>
      );
    }

    render(<Component />);

    expect(screen.getByLabelText("initialValue")).toBeInTheDocument();
    expect(spy).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "initialValue"
    );

    await user.click(screen.getByRole("button", { name: "Change value" }));

    expect(screen.queryByLabelText("initialValue")).not.toBeInTheDocument();
    expect(screen.getByLabelText("newValue")).toBeInTheDocument();
    expect(spy).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "newValue"
    );
  });
});
