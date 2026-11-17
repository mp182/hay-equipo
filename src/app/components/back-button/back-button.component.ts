import { Component, inject, input } from '@angular/core';
import { IonButton, IonIcon } from '@ionic/angular';

import { NavigationHistoryService } from 'src/app/services/navigation-history.service';

/**
 * Flecha de "volver" de la barra superior. A diferencia de `ion-back-button` (que abre la pantalla anterior
 * como una navegación nueva), retrocede en el historial, igual que el botón atrás del celular.
 */
@Component({
  selector: 'app-back-button',
  template: `
    <ion-button (click)="history.back(fallback())" aria-label="Volver">
      <ion-icon slot="icon-only" name="arrow-back-sharp" aria-hidden="true"></ion-icon>
    </ion-button>
  `,
  imports: [IonButton, IonIcon],
})
export class BackButtonComponent {

  protected readonly history = inject(NavigationHistoryService);

  /** Adónde ir si no hay pantalla anterior (por ejemplo, si se abrió la app directo en esta pantalla). */
  readonly fallback = input('/dashboard');

}
