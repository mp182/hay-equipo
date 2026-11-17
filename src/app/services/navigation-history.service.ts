import { Location } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { NavController } from '@ionic/angular';

const STORAGE_KEY = 'navigation-history';
const HOME = '/dashboard';

/**
 * Lleva la cuenta de las pantallas que hay en el historial del navegador, para que "volver" se comporte
 * como en una app nativa: retrocede en el historial (como el botón atrás del celular) en vez de abrir
 * la pantalla anterior otra vez.
 *
 * Así el dashboard queda primero en el historial y, desde ahí, el botón atrás del celular cierra la app
 * instalada, en lugar de volver a la última pantalla que se miró.
 */
@Injectable({ providedIn: 'root' })
export class NavigationHistoryService {

  private readonly location = inject(Location);
  private readonly navCtrl = inject(NavController);
  private readonly router = inject(Router);

  /** URLs del historial de esta pestaña, la actual al final. Sobrevive a recargar la página. */
  private stack: string[] = loadStack();
  private initialized = false;
  private trigger: NavigationStart['navigationTrigger'];
  private replaceUrl = false;

  constructor() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.trigger = event.navigationTrigger;
        this.replaceUrl = !!this.router.currentNavigation()?.extras.replaceUrl;
      } else if (event instanceof NavigationEnd) {
        this.record(event.urlAfterRedirects);
      }
    });
  }

  /** Flecha de "volver": retrocede en el historial; si no hay a dónde, va al inicio sin dejar rastro. */
  back(fallback = HOME) {
    if (this.stack.length > 1) {
      return this.navCtrl.back();
    }
    return this.goTo(fallback);
  }

  /**
   * Vuelve a `url` después de terminar algo (guardar, bajarse del partido…). Si esa pantalla ya está
   * más atrás en el historial, retrocede hasta ella; si no, la abre reemplazando la actual.
   * Nunca agrega una entrada nueva al historial.
   */
  backTo(url: string) {
    const target = normalize(url);
    const index = this.stack.lastIndexOf(target, this.stack.length - 2);
    if (index >= 0) {
      this.location.historyGo(index - (this.stack.length - 1));
      return Promise.resolve(true);
    }
    return this.goTo(target);
  }

  private goTo(url: string) {
    const target = normalize(url);
    return target === HOME
      ? this.navCtrl.navigateRoot(target, { replaceUrl: true })
      : this.navCtrl.navigateBack(target, { replaceUrl: true });
  }

  private record(url: string) {
    if (!this.initialized) {
      this.initialized = true;
      // Al recargar, el historial guardado sigue valiendo si termina en la pantalla actual.
      if (this.stack.at(-1) !== url) {
        this.stack = [url];
      }
    } else if (this.trigger === 'popstate') {
      // Atrás (o adelante) del navegador: se recorta hasta esa pantalla, o se suma si era hacia adelante.
      const index = this.stack.lastIndexOf(url, this.stack.length - 2);
      if (index >= 0) {
        this.stack.length = index + 1;
      } else {
        this.stack.push(url);
      }
    } else if (this.replaceUrl && this.stack.length) {
      this.stack[this.stack.length - 1] = url;
    } else {
      this.stack.push(url);
    }
    saveStack(this.stack);
  }

}

function normalize(url: string) {
  return url.startsWith('/') ? url : '/' + url;
}

function loadStack(): string[] {
  try {
    const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(saved) ? saved.filter(item => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

function saveStack(stack: string[]) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stack));
  } catch {
    // Sin sessionStorage (modo privado, por ejemplo) se pierde solo al recargar.
  }
}
