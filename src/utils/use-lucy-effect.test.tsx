import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { useLucyEffect } from "./use-lucy-effect";
import { useLucyState } from "../use-lucy-state";

describe("useLucyEffect", () => {
  it("executes a callback every time a subscribed value changes", async () => {
    const user = userEvent.setup();
    const spy = jest.fn();
    let newValue1 = 5;
    let newValue2 = 10;
    let newValue3 = 15;
    function Component() {
      const [value1$, setValue1] = useLucyState(1);
      const [value2$, setValue2] = useLucyState(2);
      const [value3$, setValue3] = useLucyState(3);

      useLucyEffect(
        ([]) => {
          spy();
        },
        [value1$, value2$]
      );

      return (
        <div>
          <h3>
            Value3 is: <value3$.Value />
          </h3>
          <button onClick={() => setValue1(newValue1)}>Change value1</button>
          <button onClick={() => setValue2(newValue2)}>Change value2</button>
          <button onClick={() => setValue3(newValue3)}>Change value3</button>
        </div>
      );
    }

    render(<Component />);
    expect(spy).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole("button", { name: "Change value1" }));
    expect(spy).toHaveBeenCalledTimes(2);

    await user.click(screen.getByRole("button", { name: "Change value3" }));
    expect(spy).toHaveBeenCalledTimes(2);

    await user.click(screen.getByRole("button", { name: "Change value2" }));
    expect(spy).toHaveBeenCalledTimes(3);
  });

  it("receives correct values in the callback", async () => {
    const user = userEvent.setup();
    const spy = jest.fn();
    let newValue1 = 5;
    let newValue2 = 10;
    let newValue3 = 15;
    function Component() {
      const [value1$, setValue1] = useLucyState(1);
      const [value2$, setValue2] = useLucyState(2);
      const [value3$, setValue3] = useLucyState(3);

      useLucyEffect(
        ([value1, value2]) => {
          spy(value1, value2);
        },
        [value1$, value2$]
      );

      return (
        <div>
          <h3>
            Value3 is: <value3$.Value />
          </h3>
          <button onClick={() => setValue1(newValue1)}>Change value1</button>
          <button onClick={() => setValue2(newValue2)}>Change value2</button>
          <button onClick={() => setValue3(newValue3)}>Change value3</button>
        </div>
      );
    }

    render(<Component />);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenLastCalledWith(1, 2);

    await user.click(screen.getByRole("button", { name: "Change value1" }));
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy).toHaveBeenLastCalledWith(5, 2);

    await user.click(screen.getByRole("button", { name: "Change value3" }));
    expect(spy).toHaveBeenCalledTimes(2);

    await user.click(screen.getByRole("button", { name: "Change value2" }));
    expect(spy).toHaveBeenCalledTimes(3);
    expect(spy).toHaveBeenLastCalledWith(5, 10);
  });
});
