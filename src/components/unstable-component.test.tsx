import { useEffect } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { useLucyState } from "../use-lucy-state";
import { UnstableComponent } from "./unstable-component";

describe("<UnstableComponent />", () => {
  it("converts state$ to regular props", async () => {
    const user = userEvent.setup();
    const spy = jest.fn();
    let newValue = "second value";
    function Content({ value }: { value: string }) {
      useEffect(spy);

      return <h1>{value}</h1>;
    }
    function Component() {
      const [state$, setState] = useLucyState("first value");

      return (
        <div>
          <button onClick={() => setState(newValue)}>Change value</button>
          <UnstableComponent items$={[state$]}>
            {(items) => <Content value={items[0]} />}
          </UnstableComponent>
        </div>
      );
    }

    render(<Component />);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "first value"
    );

    await user.click(screen.getByRole("button", { name: "Change value" }));

    expect(spy).toHaveBeenCalledTimes(2);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "second value"
    );
  });

  it("allows multiple values to be passed", async () => {
    const user = userEvent.setup();
    const spy = jest.fn();
    let newName = "Second name";
    let newAge = 35;
    let newLabel = "info";
    function Content({
      name,
      age,
      label,
    }: {
      name: string;
      age: number;
      label: string;
    }) {
      useEffect(spy);

      return <h1 aria-label={label}>{`name is ${name}, and age is ${age}`}</h1>;
    }
    function Component() {
      const [name$, setName] = useLucyState("Initial name");
      const [age$, setAge] = useLucyState(25);
      const [label$, setLabel] = useLucyState("credentials");

      return (
        <div>
          <button onClick={() => setName(newName)}>Change name</button>
          <button onClick={() => setAge(newAge)}>Change age</button>
          <button onClick={() => setLabel(newLabel)}>Change label</button>
          <UnstableComponent items$={[name$, age$, label$]}>
            {([name, age, label]) => {
              return <Content name={name} age={age} label={label} />;
            }}
          </UnstableComponent>
        </div>
      );
    }

    render(<Component />);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(
      screen.getByRole("heading", { name: "credentials" })
    ).toHaveTextContent("name is Initial name, and age is 25");

    await user.click(screen.getByRole("button", { name: "Change name" }));

    expect(spy).toHaveBeenCalledTimes(2);
    expect(
      screen.getByRole("heading", { name: "credentials" })
    ).toHaveTextContent("name is Second name, and age is 25");

    await user.click(screen.getByRole("button", { name: "Change age" }));
    await user.click(screen.getByRole("button", { name: "Change label" }));

    expect(spy).toHaveBeenCalledTimes(4);
    expect(screen.getByRole("heading", { name: "info" })).toHaveTextContent(
      "name is Second name, and age is 35"
    );
  });
});
