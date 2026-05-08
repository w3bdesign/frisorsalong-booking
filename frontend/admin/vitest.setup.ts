// Ensure localStorage is available before @vue/devtools-kit initializes.
// The devtools-kit accesses localStorage.getItem at module load time,
// which can fire before jsdom has fully set up the Storage prototype.
if (
  globalThis.localStorage === undefined ||
  typeof globalThis.localStorage.getItem !== 'function'
) {
  const storage: Record<string, string> = {};
  globalThis.localStorage = {
    getItem: (key: string) => storage[key] ?? null,
    setItem: (key: string, value: string) => {
      storage[key] = value;
    },
    removeItem: (key: string) => {
      delete storage[key];
    },
    clear: () => {
      for (const key of Object.keys(storage)) {
        delete storage[key];
      }
    },
    get length() {
      return Object.keys(storage).length;
    },
    key: (index: number) => Object.keys(storage)[index] ?? null,
  } as Storage;
}
