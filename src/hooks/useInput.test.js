import {
  describe,
  it,
  expect,
} from "vitest";

import { useInput } from "./useInput";

describe("useInput", () => {
  it("handles input", () => {
    const x = useInput("a");

    x.onInput({
      target: {
        value: "b",
      },
    });

    expect(x.value.value).toBe("b");

    x.reset();

    expect(x.value.value).toBe("a");
  });

  it("uses an empty string when initial value is omitted", () => {
    const x = useInput();

    expect(x.value.value).toBe("");

    x.onInput({
      target: {
        value: "test",
      },
    });

    expect(x.value.value).toBe("test");

    x.reset();

    expect(x.value.value).toBe("");
  });

  it("uses the event itself when target value is unavailable", () => {
    const x = useInput("initial");
    const eventValue = "direct value";

    x.onInput(eventValue);

    expect(x.value.value).toBe(eventValue);
  });
});