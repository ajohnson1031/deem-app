export const getChangedFields = <T extends Record<string, any>>(
  original: T,
  updated: T
): Record<string, Partial<T> | boolean> => {
  const changes: Partial<T> = {};
  for (const key in updated) {
    if (updated[key] !== original[key]) {
      changes[key] = updated[key];
    }
  }
  return { changes, hasChanges: Object.keys(changes).length > 0 };
};
