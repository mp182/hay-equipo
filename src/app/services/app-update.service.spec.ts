import { TestBed } from '@angular/core/testing';
import { SwUpdate, VersionEvent } from '@angular/service-worker';
import { AlertController, ModalController, ToastController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { APP_VERSION } from '../app-version';
import { CHANGELOG, changesBetween } from '../changelog';
import { compareVersions } from '../helpers/version.helpers';
import { AppUpdateService, LAST_SEEN_VERSION_KEY, RELOAD_PAGE, UPDATE_CHECK_INTERVAL } from './app-update.service';

const READY: VersionEvent = {
  type: 'VERSION_READY',
  currentVersion: { hash: 'a' },
  latestVersion: { hash: 'b' },
};

/** Lo que se le pasa a un `create()` de Ionic, y un overlay falso que se puede cerrar. */
function overlayController() {
  const dismissed: (() => void)[] = [];
  const create = vi.fn(async (options: any) => ({
    options,
    present: vi.fn(async () => undefined),
    onDidDismiss: () => new Promise<void>(resolve => dismissed.push(resolve)),
    dismiss: () => dismissed.forEach(resolve => resolve()),
  }));
  return { create, dismissAll: () => dismissed.splice(0).forEach(resolve => resolve()) };
}

describe('AppUpdateService', () => {
  let swUpdate: {
    isEnabled: boolean;
    versionUpdates: Subject<VersionEvent>;
    unrecoverable: Subject<{ type: 'UNRECOVERABLE_STATE'; reason: string }>;
    checkForUpdate: ReturnType<typeof vi.fn>;
    activateUpdate: ReturnType<typeof vi.fn>;
  };
  let toasts: ReturnType<typeof overlayController>;
  let alerts: ReturnType<typeof overlayController>;
  let modals: ReturnType<typeof overlayController>;
  let reload: ReturnType<typeof vi.fn>;
  let visibility: DocumentVisibilityState;

  function setup(isEnabled = true) {
    swUpdate = {
      isEnabled,
      versionUpdates: new Subject(),
      unrecoverable: new Subject(),
      checkForUpdate: vi.fn(async () => false),
      activateUpdate: vi.fn(async () => true),
    };
    toasts = overlayController();
    alerts = overlayController();
    modals = overlayController();

    // `visibilityState` del documento de jsdom no se puede cambiar: se espía.
    reload = vi.fn();
    visibility = 'visible';
    vi.spyOn(document, 'visibilityState', 'get').mockImplementation(() => visibility);

    TestBed.configureTestingModule({
      providers: [
        { provide: SwUpdate, useValue: swUpdate },
        { provide: ToastController, useValue: toasts },
        { provide: AlertController, useValue: alerts },
        { provide: ModalController, useValue: modals },
        { provide: RELOAD_PAGE, useValue: reload },
      ]
    });
    return TestBed.inject(AppUpdateService);
  }

  const flush = () => new Promise(resolve => setTimeout(resolve));

  // Node 26 trae su propio `localStorage` global (vacío sin `--localstorage-file`) que tapa el de jsdom.
  beforeEach(() => {
    const store = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => store.set(key, String(value)),
      removeItem: (key: string) => store.delete(key),
      clear: () => store.clear(),
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    TestBed.resetTestingModule();
  });

  it('sin service worker (desarrollo, emuladores) no hace nada', async () => {
    const service = setup(false);
    service.init();
    await service.checkForUpdate();
    document.dispatchEvent(new Event('visibilitychange'));
    expect(swUpdate.checkForUpdate).not.toHaveBeenCalled();
  });

  it('cuando la versión nueva está lista, avisa una sola vez aunque llegue dos veces', async () => {
    const service = setup();
    service.init();
    swUpdate.versionUpdates.next(READY);
    swUpdate.versionUpdates.next(READY);
    await flush();
    expect(toasts.create).toHaveBeenCalledTimes(1);

    // Si lo cierra con "Después", la próxima versión vuelve a avisar.
    toasts.dismissAll();
    await flush();
    swUpdate.versionUpdates.next(READY);
    await flush();
    expect(toasts.create).toHaveBeenCalledTimes(2);
  });

  it('no avisa por los otros eventos del service worker', async () => {
    const service = setup();
    service.init();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    swUpdate.versionUpdates.next({ type: 'VERSION_DETECTED', version: { hash: 'b' } });
    swUpdate.versionUpdates.next({ type: 'NO_NEW_VERSION_DETECTED', version: { hash: 'a' } });
    swUpdate.versionUpdates.next({ type: 'VERSION_INSTALLATION_FAILED', version: { hash: 'b' }, error: 'x' });
    await flush();
    expect(toasts.create).not.toHaveBeenCalled();
  });

  it('"Actualizar" activa la versión nueva y después recarga', async () => {
    const service = setup();
    service.init();
    swUpdate.versionUpdates.next(READY);
    await flush();

    const updateButton = toasts.create.mock.calls[0][0].buttons.find((b: any) => b.text === 'Actualizar');
    updateButton.handler();
    await flush();

    expect(swUpdate.activateUpdate).toHaveBeenCalled();
    expect(reload).toHaveBeenCalled();
    expect(swUpdate.activateUpdate.mock.invocationCallOrder[0]).toBeLessThan(reload.mock.invocationCallOrder[0]);
  });

  it('si no se puede activar, recarga igual', async () => {
    const service = setup();
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    swUpdate.activateUpdate.mockRejectedValue(new Error('no'));
    await service.activateAndReload();
    expect(reload).toHaveBeenCalled();
  });

  it('busca una versión nueva al volver a la app, no al irse', () => {
    const service = setup();
    service.init();

    visibility = 'hidden';
    document.dispatchEvent(new Event('visibilitychange'));
    expect(swUpdate.checkForUpdate).not.toHaveBeenCalled();

    visibility = 'visible';
    document.dispatchEvent(new Event('visibilitychange'));
    expect(swUpdate.checkForUpdate).toHaveBeenCalledTimes(1);
  });

  it('busca una versión nueva cada 30 minutos', () => {
    vi.useFakeTimers();
    const service = setup();
    service.init();
    vi.advanceTimersByTime(UPDATE_CHECK_INTERVAL - 1);
    expect(swUpdate.checkForUpdate).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(swUpdate.checkForUpdate).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(UPDATE_CHECK_INTERVAL);
    expect(swUpdate.checkForUpdate).toHaveBeenCalledTimes(2);
  });

  it('si falla la búsqueda (sin conexión) no rompe nada', async () => {
    const service = setup();
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    swUpdate.checkForUpdate.mockRejectedValue(new Error('offline'));
    await expect(service.checkForUpdate()).resolves.toBeUndefined();
  });

  it('si el service worker no se puede recuperar, pide recargar', async () => {
    const service = setup();
    service.init();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    swUpdate.unrecoverable.next({ type: 'UNRECOVERABLE_STATE', reason: 'cache borrada' });
    await flush();
    expect(alerts.create).toHaveBeenCalledTimes(1);
    alerts.create.mock.calls[0][0].buttons[0].handler();
    expect(reload).toHaveBeenCalled();
  });

  describe('novedades', () => {
    it('la primera vez en este navegador no muestra nada, pero recuerda la versión', async () => {
      const service = setup();
      await service.showWhatsNew();
      expect(modals.create).not.toHaveBeenCalled();
      expect(localStorage.getItem(LAST_SEEN_VERSION_KEY)).toBe(APP_VERSION);
    });

    it('después de actualizar muestra las novedades una sola vez', async () => {
      const service = setup();
      localStorage.setItem(LAST_SEEN_VERSION_KEY, '0.0.1');
      await service.showWhatsNew();
      expect(modals.create).toHaveBeenCalledTimes(1);
      expect(modals.create.mock.calls[0][0].componentProps.entries[0].version).toBe(APP_VERSION);

      await service.showWhatsNew();
      expect(modals.create).toHaveBeenCalledTimes(1);
    });

    it('funcionan también sin service worker', async () => {
      const service = setup(false);
      localStorage.setItem(LAST_SEEN_VERSION_KEY, '0.0.1');
      await service.showWhatsNew();
      expect(modals.create).toHaveBeenCalledTimes(1);
    });
  });
});

describe('changelog', () => {
  it('tiene las novedades de la versión actual (agregalas al subir la versión)', () => {
    expect(CHANGELOG.map(entry => entry.version)).toContain(APP_VERSION);
  });

  it('va de la versión más nueva a la más vieja, sin repetir', () => {
    const versions = CHANGELOG.map(entry => entry.version);
    expect(new Set(versions).size).toBe(versions.length);
    versions.slice(1).forEach((version, i) => expect(compareVersions(versions[i], version)).toBeGreaterThan(0));
  });

  it('changesBetween trae solo las versiones nuevas, la más nueva primero', () => {
    const changelog = [
      { version: '2.2.0', changes: ['c'] },
      { version: '2.1.0', changes: ['b'] },
      { version: '2.0.0', changes: ['a'] },
    ];
    expect(changesBetween('2.0.0', '2.2.0', changelog).map(e => e.version)).toEqual(['2.2.0', '2.1.0']);
    expect(changesBetween('2.1.0', '2.1.0', changelog)).toEqual([]);
  });

  it('compareVersions compara número por número', () => {
    expect(compareVersions('2.10.0', '2.9.0')).toBeGreaterThan(0);
    expect(compareVersions('2.0.0', '2.0.0')).toBe(0);
    expect(compareVersions('1.9.9', '2.0.0')).toBeLessThan(0);
  });
});
