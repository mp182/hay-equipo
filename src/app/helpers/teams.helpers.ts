import { Player } from '../models/player.interface';

/**
 * `true` si los equipos armados no son exactamente los anotados del partido
 * (alguien se bajó o entró después de armarlos, o quedó repetido en los dos equipos).
 */
export function teamsOutOfDate(playersList: string[], teamWhite: Pick<Player, 'id'>[], teamBlack: Pick<Player, 'id'>[]) {
  const inTeams = [...teamWhite, ...teamBlack].map(player => player.id);
  const unique = new Set(inTeams);
  return unique.size !== inTeams.length
    || unique.size !== new Set(playersList).size
    || playersList.some(id => !unique.has(id));
}
