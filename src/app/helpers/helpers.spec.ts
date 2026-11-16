import { nextSaturday, toLocalIsoString } from './date.helpers';
import { firebaseErrors } from './firebaseErrors';
import { playerScore, sortByScore } from './score.helpers';
import { titleCase } from './string.helpers';
import { teamsOutOfDate } from './teams.helpers';

describe('playerScore', () => {
  it('vale 50 con menos de 10 partidos jugados', () => {
    expect(playerScore({ played: 9, won: 9 })).toBe(50);
  });

  it('es el porcentaje de ganados con 10 o más partidos', () => {
    expect(playerScore({ played: 20, won: 15 })).toBe(75);
    expect(playerScore({ played: 12, won: 0 })).toBe(0);
  });

  it('sortByScore ordena de mayor a menor sin mutar el array', () => {
    const players = [{ played: 10, won: 2 }, { played: 10, won: 9 }, { played: 3, won: 0 }];
    expect(sortByScore(players).map(p => p.won)).toEqual([9, 0, 2]);
    expect(players[0].won).toBe(2);
  });
});

describe('titleCase', () => {
  it('pone en mayúscula la primera letra de cada palabra', () => {
    expect(titleCase('  juan PÉREZ ')).toBe('Juan Pérez');
  });
});

describe('date helpers', () => {
  it('nextSaturday devuelve un sábado a la hora pedida', () => {
    const date = nextSaturday(19, 0);
    expect(date.getDay()).toBe(6);
    expect(date.getHours()).toBe(19);
    expect(date.getMinutes()).toBe(0);
  });

  it('toLocalIsoString usa la hora local', () => {
    expect(toLocalIsoString(new Date(2026, 0, 3, 9, 5))).toBe('2026-01-03T09:05');
  });
});

describe('firebaseErrors', () => {
  it('avisa si el navegador bloqueó el popup', () => {
    expect(firebaseErrors('auth/popup-blocked')).toContain('ventanas emergentes');
  });

  it('no muestra error si se cierra el popup de Google', () => {
    expect(firebaseErrors('auth/popup-closed-by-user')).toBe('');
  });
});

describe('teamsOutOfDate', () => {
  const ids = (...list: string[]) => list.map(id => ({ id }));

  it('los equipos coinciden con los anotados', () => {
    expect(teamsOutOfDate(['a', 'b', 'c', 'd'], ids('a', 'c'), ids('b', 'd'))).toBe(false);
  });

  it('alguien se bajó después de armar los equipos', () => {
    expect(teamsOutOfDate(['a', 'b', 'c'], ids('a', 'c'), ids('b', 'd'))).toBe(true);
  });

  it('alguien entró después de armar los equipos', () => {
    expect(teamsOutOfDate(['a', 'b', 'c', 'd', 'e'], ids('a', 'c'), ids('b', 'd'))).toBe(true);
  });

  it('alguien quedó en los dos equipos', () => {
    expect(teamsOutOfDate(['a', 'b', 'c'], ids('a', 'c'), ids('b', 'c'))).toBe(true);
  });

  it('sin equipos armados no coinciden', () => {
    expect(teamsOutOfDate(['a', 'b'], [], [])).toBe(true);
  });
});
