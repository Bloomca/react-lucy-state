import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { useLucyState } from "../src/use-lucy-state";

describe("Lucy Start use track value", () => {
  it("track value is triggered correctly", async () => {
    const spy = jest.fn();
    const user = userEvent.setup();

    let newValue = "new value";
    function Component() {
      const [state$, setState] = useLucyState("initial value");

      state$.useTrackValue((stateValue) => {
        spy(stateValue);
      });

      return (
        <div>
          <button onClick={() => setState(newValue)}>Change value</button>
        </div>
      );
    }

    render(<Component />);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith("initial value");

    await user.click(screen.getByRole("button", { name: "Change value" }));

    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy).toHaveBeenCalledWith("new value");
  });

  it("track value can skip the first call", async () => {
    const spy = jest.fn();
    const user = userEvent.setup();

    let newValue = "new value";
    function Component() {
      const [state$, setState] = useLucyState("initial value");

      state$.useTrackValue(
        (stateValue) => {
          spy(stateValue);
        },
        { skipFirstCall: true }
      );

      return (
        <div>
          <button onClick={() => setState(newValue)}>Change value</button>
        </div>
      );
    }

    render(<Component />);

    expect(spy).toHaveBeenCalledTimes(0);

    await user.click(screen.getByRole("button", { name: "Change value" }));

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith("new value");
  });
});
