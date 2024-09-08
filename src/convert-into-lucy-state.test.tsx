import { useState, useEffect } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { useLucyState } from "./use-lucy-state";
import {
  useConvertLucyStateToProperty,
  useConvertToLucyState,
} from "./convert-into-lucy-state";
import { StableComponent } from "./components/stable-component";

import type { LucyState } from "./types";

describe("React interop", () => {
  describe("useConvertLucyStateToProperty", () => {
    it("converts the state and updates the value correctly", async () => {
      const user = userEvent.setup();
      function Component() {
        const value$ = useLucyState(0);

        return (
          <div>
            <button onClick={() => value$.setValue(value$.getValue() + 1)}>
              Increment value
            </button>
            <Content value$={value$} />
          </div>
        );
      }

      function Content({ value$ }: { value$: LucyState<number> }) {
        const value = useConvertLucyStateToProperty(value$);

        return <h2>Current value is {value}</h2>;
      }

      render(<Component />);

      expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
        "Current value is 0"
      );

      await user.click(screen.getByRole("button", { name: "Increment value" }));

      expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
        "Current value is 1"
      );
    });
  });

  describe("useConvertToLucyState", () => {
    it("converts to a LucyState and updates it with every value", async () => {
      const user = userEvent.setup();
      const spy = jest.fn();
      function Component() {
        const [value, setValue] = useState(0);
        const value$ = useConvertToLucyState(value);

        return (
          <div>
            <button onClick={() => setValue(value + 1)}>Increment value</button>
            <StableComponent>
              <Content value$={value$} />
            </StableComponent>
          </div>
        );
      }

      function Content({ value$ }: { value$: LucyState<number> }) {
        useEffect(spy);

        return (
          <h2>
            Current value is <value$.Value />
          </h2>
        );
      }

      render(<Component />);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
        "Current value is 0"
      );

      await user.click(screen.getByRole("button", { name: "Increment value" }));

      expect(spy).toHaveBeenCalledTimes(1);
      expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
        "Current value is 1"
      );
    });
  });
});
