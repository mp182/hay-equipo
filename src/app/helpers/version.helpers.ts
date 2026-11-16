/** Compara dos versiones `mayor.menor.parche`: negativo si `a` es anterior a `b`, 0 si son iguales, positivo si es posterior. */
export function compareVersions(a: string, b: string): number {
  const partsA = a.split('.').map(part => parseInt(part, 10) || 0);
  const partsB = b.split('.').map(part => parseInt(part, 10) || 0);
  for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
    const diff = (partsA[i] ?? 0) - (partsB[i] ?? 0);
    if (diff !== 0) {
      return diff;
    }
  }
  return 0;
}
