import { useState, useEffect } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { useConvertToLucyState } from "../convert-into-lucy-state";
import { StableComponent } from "./stable-component";

import type { LucyState } from "../types";

describe("<StableComponent />", () => {
  it("does not re-render the stable component", async () => {
    const spy = jest.fn();
    function Content({ state }: { state: string }) {
      useEffect(() => {
        spy();
      });

      return <h2>Stable Content value: {state}</h2>;
    }
    function Component() {
      const [state, setState] = useState("initial state");

      return (
        <div>
          <button onClick={() => setState("first state")}>First button</button>
          <StableComponent>
            <Content state={state} />
          </StableComponent>
        </div>
      );
    }

    render(<Component />);

    const user = userEvent.setup();

    expect(spy).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "Stable Content value: initial state"
    );

    await user.click(screen.getByRole("button", { name: "First button" }));

    expect(spy).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "Stable Content value: initial state"
    );
  });

  it("does not re-render stable component inline content", async () => {
    function Component() {
      const [state, setState] = useState("initial state");

      return (
        <div>
          <button onClick={() => setState("first state")}>First button</button>
          <StableComponent>
            <h2>Stable Content value: {state}</h2>
          </StableComponent>
        </div>
      );
    }

    render(<Component />);

    const user = userEvent.setup();

    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "Stable Content value: initial state"
    );

    await user.click(screen.getByRole("button", { name: "First button" }));

    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "Stable Content value: initial state"
    );
  });

  it("updates the stable component correctly if LucyState is passed inline", async () => {
    function Component() {
      const [state, setState] = useState("initial state");
      const state$ = useConvertToLucyState(state);

      return (
        <div>
          <button onClick={() => setState("first state")}>First button</button>
          <StableComponent>
            <h2>
              Stable Content value: <state$.Value />
            </h2>
          </StableComponent>
        </div>
      );
    }

    render(<Component />);

    const user = userEvent.setup();

    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "Stable Content value: initial state"
    );

    await user.click(screen.getByRole("button", { name: "First button" }));

    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "Stable Content value: first state"
    );
  });

  it("updates the stable component correctly if LucyState is passed as a prop", async () => {
    const spy = jest.fn();
    function Content({ state$ }: { state$: LucyState<string> }) {
      useEffect(() => {
        spy();
      });

      return (
        <h2>
          Stable Content value: <state$.Value />
        </h2>
      );
    }
    function Component() {
      const [state, setState] = useState("initial state");
      const state$ = useConvertToLucyState(state);

      return (
        <div>
          <button onClick={() => setState("first state")}>First button</button>
          <StableComponent>
            <Content state$={state$} />
          </StableComponent>
        </div>
      );
    }

    render(<Component />);

    const user = userEvent.setup();

    expect(spy).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "Stable Content value: initial state"
    );

    await user.click(screen.getByRole("button", { name: "First button" }));

    expect(spy).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "Stable Content value: first state"
    );
  });
});
