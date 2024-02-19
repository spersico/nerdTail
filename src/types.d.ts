declare module 'solid-dexie' {
  export function createDexieSignalQuery<T>(
    query: () => Promise<T>
  ): [() => T, (value: T) => void];

  export function createDexieArrayQuery<T>(query: () => Promise<T[]>): T[];
}
