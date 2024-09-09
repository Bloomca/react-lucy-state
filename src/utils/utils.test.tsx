import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { useLucyState } from "../use-lucy-state";
import { useReduce$ } from "./reduce";

describe("utility functions", () => {
  describe("useReduce$", () => {
    it("correctly listens to all passed lucy states", async () => {
      const user = userEvent.setup();
      const spy = jest.fn();
      let newValue1 = 5;
      let newValue2 = "Updated value";
      function Component() {
        const value1$ = useLucyState(0);
        const value2$ = useLucyState("Initial value");

        const combinedValue$ = useReduce$(
          [value1$, value2$],
          ([value1, value2]) => `${value2}: ${value1}`
        );

        combinedValue$.useTrackValue(spy);

        return (
          <div>
            <button onClick={() => value1$.setValue(newValue1)}>
              Change value1
            </button>
            <button onClick={() => value2$.setValue(newValue2)}>
              Change value2
            </button>
          </div>
        );
      }

      render(<Component />);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenLastCalledWith("Initial value: 0");

      await user.click(screen.getByRole("button", { name: "Change value2" }));

      expect(spy).toHaveBeenCalledTimes(2);
      expect(spy).toHaveBeenLastCalledWith("Updated value: 0");

      await user.click(screen.getByRole("button", { name: "Change value1" }));

      expect(spy).toHaveBeenCalledTimes(3);
      expect(spy).toHaveBeenLastCalledWith("Updated value: 5");
    });
  });
});
