import { ref } from "vue";

export function useInput(initial = "") {
  const value = ref(initial);

  const onInput = (event) => {
    value.value =
      event?.target?.value ?? event;
  };

  const reset = (v = initial) => {
    value.value = v;
  };

  return {
    value,
    onInput,
    reset,
  };
}