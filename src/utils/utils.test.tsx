import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { useLucyState } from "../use-lucy-state";
import { useReduce$ } from "./reduce";
import { useSelect$ } from "./select";

describe("utility functions", () => {
  describe("useReduce$", () => {
    it("correctly listens to all passed lucy states", async () => {
      const user = userEvent.setup();
      const spy = jest.fn();
      let newValue1 = 5;
      let newValue2 = "Updated value";
      function Component() {
        const [value1$, setValue1] = useLucyState(0);
        const [value2$, setValue2] = useLucyState("Initial value");

        const combinedValue$ = useReduce$(
          [value1$, value2$],
          ([value1, value2]) => `${value2}: ${value1}`
        );

        combinedValue$.useTrackValue(spy);

        return (
          <div>
            <button onClick={() => setValue1(newValue1)}>Change value1</button>
            <button onClick={() => setValue2(newValue2)}>Change value2</button>
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

    it("does not update the value if comparator returns false", async () => {
      const user = userEvent.setup();
      const spy = jest.fn();
      let state = {
        firstValue: "some",
        secondValue: "more",
        thirdValue: "and even more",
      };
      function Component() {
        const [state$, setState] = useLucyState(state);
        const [value$, setValue] = useLucyState(0);

        const reducedValue$ = useReduce$(
          [state$, value$],
          ([stateObject, value]) => ({
            first: stateObject.firstValue,
            second: stateObject.secondValue,
            incrementValue: value,
          }),
          (previousValue, nextValue) =>
            previousValue.first === nextValue.first &&
            previousValue.second === nextValue.second &&
            previousValue.incrementValue === nextValue.incrementValue
        );

        reducedValue$.useTrackValue(spy);

        return (
          <div>
            <button onClick={() => setValue((value) => value + 1)}>
              Increment
            </button>
            <button onClick={() => setState(state)}>Update state</button>
          </div>
        );
      }

      render(<Component />);

      expect(spy).toHaveBeenCalledTimes(1);

      await user.click(screen.getByRole("button", { name: "Increment" }));

      expect(spy).toHaveBeenCalledTimes(2);

      state = {
        firstValue: "some",
        secondValue: "more",
        thirdValue: "new third value",
      };
      await user.click(screen.getByRole("button", { name: "Update state" }));

      expect(spy).toHaveBeenCalledTimes(2);
    });
  });

  describe("useSelect$", () => {
    it("does not update the value if comparator returns false", async () => {
      const spy = jest.fn();
      const user = userEvent.setup();
      function Component() {
        const [value$, setValue] = useLucyState(0);
        const valueWithStep$ = useSelect$(
          value$,
          (value) => value,
          (previousValue, nextValue) => nextValue - previousValue <= 2
        );

        valueWithStep$.useTrackValue(spy, { skipFirstCall: true });

        return (
          <div>
            <button onClick={() => setValue((value) => value + 1)}>
              Increment
            </button>
            <h2>
              Step value: <valueWithStep$.Value />
            </h2>
          </div>
        );
      }

      render(<Component />);

      expect(spy).toHaveBeenCalledTimes(0);
      expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
        "Step value: 0"
      );

      await user.click(screen.getByRole("button", { name: "Increment" }));
      expect(spy).toHaveBeenCalledTimes(0);

      await user.click(screen.getByRole("button", { name: "Increment" }));
      expect(spy).toHaveBeenCalledTimes(0);

      await user.click(screen.getByRole("button", { name: "Increment" }));
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenLastCalledWith(3);

      expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
        "Step value: 3"
      );
    });
  });
});
