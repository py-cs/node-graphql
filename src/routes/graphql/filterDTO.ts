export function filterDTO<T extends Record<string, unknown>>(
  dto: T
): Partial<T> {
  const entries = Object.entries(dto);
  for (const [key, value] of entries) {
    if (value === null) {
      delete dto[key];
    }
  }
  return dto;
}
