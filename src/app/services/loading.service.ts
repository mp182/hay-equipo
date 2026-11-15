import { Injectable, computed, signal } from '@angular/core';

/**
 * Loader global de la app. El overlay (el logo con los jugadores saltando) lo dibuja `AppComponent`.
 * Lleva la cuenta de cuántas tareas están en curso para no cerrarlo antes de tiempo.
 */
@Injectable({ providedIn: 'root' })
export class LoadingService {

  private readonly pending = signal(0);

  readonly message = signal('Trabajando...');
  readonly visible = computed(() => this.pending() > 0);

  async showLoading(message = 'Trabajando...') {
    this.message.set(message);
    this.pending.update(count => count + 1);
  }

  async hideLoading() {
    this.pending.update(count => Math.max(0, count - 1));
  }

}
