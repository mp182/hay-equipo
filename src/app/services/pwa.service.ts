import { Injectable, inject } from '@angular/core';
import { ActionSheetController, Platform } from '@ionic/angular';

@Injectable({ providedIn: 'root' })
export class PwaService {

  private readonly platform = inject(Platform);
  private readonly actionSheetController = inject(ActionSheetController);
  private promptEvent: any;

  initPwaPrompt() {
    if (this.platform.is('android')) {
      window.addEventListener('beforeinstallprompt', (event: any) => {
        event.preventDefault();
        this.promptEvent = event;
        setTimeout(() => this.openPromptComponent(), 3000);
      });
    }
  }

  private async openPromptComponent() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Instalar Hay Equipo! ⚽',
      buttons: [
        {
          text: 'Instalar',
          icon: 'download-outline',
          handler: () => {
            this.promptEvent.prompt();
          }
        }, {
          text: 'Ahora no, gracias!',
          icon: 'close',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }
}
