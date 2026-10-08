import '@testing-library/jest-dom/vitest';

Object.defineProperty(window.HTMLImageElement.prototype, 'src', {
  configurable: true,
  get() {
    return this.getAttribute('src') || '';
  },
  set(value) {
    this.setAttribute('src', value);
  },
});