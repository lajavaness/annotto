Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: () => ({
    matches: false,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
})
