// Ensure localStorage is available before @vue/devtools-kit initializes.
// The devtools-kit accesses localStorage.getItem at module load time,
// which can fire before jsdom has fully set up the Storage prototype.
if (
  globalThis.localStorage === undefined ||
  typeof globalThis.localStorage.getItem !== 'function'
) {
  const storage = new Map<string, string>();
  globalThis.localStorage = {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => {
      storage.set(key, value);
    },
    removeItem: (key: string) => {
      storage.delete(key);
    },
    clear: () => {
      storage.clear();
    },
    get length() {
      return storage.size;
    },
    key: (index: number) => Array.from(storage.keys()).at(index) ?? null,
  } as Storage;
}
