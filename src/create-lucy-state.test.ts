import { createLucyState } from "./create-lucy-state";

describe("createLucyState", () => {
  describe("trackValue", () => {
    it("calls when the value updates correctly", () => {
      const spy = jest.fn();
      const state$ = createLucyState(1);
      state$.trackValue(spy);

      expect(spy).not.toHaveBeenCalled();

      state$.setValue(2);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(2);
    });

    it("unsubscribes correctly", () => {
      const spy = jest.fn();
      const state$ = createLucyState(1);
      const unsubscribe = state$.trackValue(spy);
      state$.setValue(2);
      unsubscribe();
      state$.setValue(3);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).not.toHaveBeenCalledWith(3);
    });
  });

  it("support initial value set as a function", () => {
    const state$ = createLucyState(() => 1);

    expect(state$.getValue()).toBe(1);
  });

  it("receives current value as a first argument if passed a function to setValue", () => {
    const spy = jest.fn();
    const state$ = createLucyState(1);
    state$.setValue((currentValue) => {
      spy(currentValue);
      return 2;
    });

    expect(spy).toHaveBeenLastCalledWith(1);

    state$.setValue((currentValue) => {
      spy(currentValue);
      return 3;
    });

    expect(spy).toHaveBeenLastCalledWith(2);
  });
});
