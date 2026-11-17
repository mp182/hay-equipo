import { Location } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { Event, NavigationEnd, NavigationStart, Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { NavigationHistoryService } from './navigation-history.service';

describe('NavigationHistoryService', () => {

  let id = 0;

  function setup() {
    sessionStorage.clear();
    const events = new Subject<Event>();
    let replaceUrl = false;
    const router = { events, currentNavigation: () => ({ extras: { replaceUrl } }) };
    const navCtrl = { back: vi.fn(), navigateRoot: vi.fn(), navigateBack: vi.fn() };
    const location = { historyGo: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: router },
        { provide: NavController, useValue: navCtrl },
        { provide: Location, useValue: location },
      ]
    });
    const service = TestBed.inject(NavigationHistoryService);

    /** Simula una navegación terminada: por la app, reemplazando la actual o con atrás del navegador. */
    function go(url: string, how: 'push' | 'replace' | 'popstate' = 'push') {
      id++;
      replaceUrl = how === 'replace';
      events.next(new NavigationStart(id, url, how === 'popstate' ? 'popstate' : 'imperative'));
      events.next(new NavigationEnd(id, url, url));
    }

    return { service, navCtrl, location, go };
  }

  afterEach(() => TestBed.resetTestingModule());

  it('la flecha retrocede en el historial cuando hay pantalla anterior', () => {
    const { service, navCtrl, go } = setup();
    go('/dashboard');
    go('/ranking');
    service.back();
    expect(navCtrl.back).toHaveBeenCalled();
  });

  it('sin pantalla anterior, la flecha va al dashboard reemplazando la actual', () => {
    const { service, navCtrl, go } = setup();
    go('/ranking');
    service.back();
    expect(navCtrl.navigateRoot).toHaveBeenCalledWith('/dashboard', { replaceUrl: true });
  });

  it('volver al dashboard después de una acción retrocede hasta él, sin sumar historial', () => {
    const { service, location, go } = setup();
    go('/dashboard');
    go('/match/m1');
    go('/add-friend/m1');
    service.backTo('/dashboard');
    expect(location.historyGo).toHaveBeenCalledWith(-2);
  });

  it('el atrás del navegador recorta el historial', () => {
    const { service, navCtrl, go } = setup();
    go('/dashboard');
    go('/ranking');
    go('/dashboard', 'popstate');
    service.back();
    expect(navCtrl.back).not.toHaveBeenCalled();
    expect(navCtrl.navigateRoot).toHaveBeenCalledWith('/dashboard', { replaceUrl: true });
  });

  it('el login reemplazado por el dashboard no queda en el historial', () => {
    const { service, navCtrl, go } = setup();
    go('/login');
    go('/dashboard', 'replace');
    service.back();
    expect(navCtrl.back).not.toHaveBeenCalled();
  });

  it('si la pantalla no está en el historial, la abre reemplazando la actual', () => {
    const { service, navCtrl, go } = setup();
    go('/change-teams/m1');
    service.backTo('match/m1');
    expect(navCtrl.navigateBack).toHaveBeenCalledWith('/match/m1', { replaceUrl: true });
  });

});
