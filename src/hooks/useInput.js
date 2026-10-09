import { ref } from "vue";

/** Composable untuk two-way binding dan perubahan nilai input form. */
export function useInput(initialValue = "") {
  const value = ref(initialValue);

  const onChange = (event) => {
    value.value = event.target.value;
  };

  const reset = (next = initialValue) => {
    value.value = next;
  };

  return { value, onChange, reset };
}
