import { afterEach, describe, expect, it, vi } from 'vitest';

import { ConnectionService } from './connection.service';

describe('ConnectionService', () => {

  afterEach(() => vi.restoreAllMocks());

  function watch(onLine: boolean) {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(onLine);
    const values: boolean[] = [];
    const subscription = new ConnectionService().monitor().subscribe(value => values.push(value));
    return { values, subscription };
  }

  it('avisa al suscribirse si la app abrió sin conexión', () => {
    const { values, subscription } = watch(false);
    expect(values).toEqual([false]);
    subscription.unsubscribe();
  });

  it('avisa los cambios de conexión sin repetir el mismo estado', () => {
    const { values, subscription } = watch(true);
    window.dispatchEvent(new Event('online'));
    window.dispatchEvent(new Event('offline'));
    window.dispatchEvent(new Event('offline'));
    window.dispatchEvent(new Event('online'));
    expect(values).toEqual([true, false, true]);
    subscription.unsubscribe();
  });

});
