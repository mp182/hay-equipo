import { compareVersions } from './helpers/version.helpers';

export interface ChangelogEntry {
  /** La misma versión que en `package.json`. */
  version: string;
  /** Lo que cambió, contado para los jugadores. */
  changes: string[];
}

/**
 * Novedades de cada versión, la más nueva primero. Se muestran una sola vez, al abrir la versión nueva.
 * Al sacar una versión (`npm version minor`), agregá acá su entrada: hay un test que lo controla.
 */
export const CHANGELOG: ChangelogEntry[] = [
  {
    version: '2.2.0',
    changes: [
      'La app tiene diseño nuevo, con los colores de la cancha.',
      'En el inicio ves tus estadísticas de un vistazo y cada partido muestra cuántos lugares quedan.',
      'En el partido, anotarte o bajarte es un solo botón, y los equipos muestran su promedio para ver si quedaron parejos.',
      'El ranking abre directo en la tabla, con podio para los tres primeros.',
      'Para cerrar sesión, la app te pregunta antes.',
    ]
  },
  {
    version: '2.1.0',
    changes: [
      'Cuando hay una versión nueva, la app avisa y se actualiza con un toque.',
      'Si alguien se baja después de armar los equipos, el resultado ya no le suma partidos: hay que volver a armarlos.',
      'Entran al ranking los jugadores con 10 partidos jugados o más.',
      'La nueva temporada no se puede aplicar dos veces por error.',
      'La app se ve bien también sin conexión.',
    ]
  },
];

/** Las novedades de las versiones posteriores a `since` y hasta `until` (inclusive), la más nueva primero. */
export function changesBetween(since: string, until: string, changelog = CHANGELOG): ChangelogEntry[] {
  return changelog
    .filter(entry => compareVersions(entry.version, since) > 0 && compareVersions(entry.version, until) <= 0)
    .sort((a, b) => compareVersions(b.version, a.version));
}
