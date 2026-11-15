import { Player } from '../models/player.interface';

/** Promedio de partidos ganados (0-100). Con menos de 10 partidos jugados vale 50. */
export function playerScore(player: Pick<Player, 'played' | 'won'>): number {
  if (player.played < 10) {
    return 50;
  }
  return player.won === 0 ? 0 : player.won * 100 / player.played;
}

/** Ordena de mayor a menor puntaje (sin modificar el array original). */
export function sortByScore<T extends Pick<Player, 'played' | 'won'>>(players: T[]): T[] {
  return [...players].sort((a, b) => playerScore(b) - playerScore(a));
}
