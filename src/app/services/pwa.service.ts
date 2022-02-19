import { Injectable } from '@angular/core';
import { ActionSheetController, Platform } from '@ionic/angular';
import { timer } from 'rxjs';
import { take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PwaService {

  private promptEvent: any;

  constructor(
    private platform: Platform,
    public actionSheetController: ActionSheetController
  ) { }

  public initPwaPrompt() {
    if (this.platform.is('android')) {
      window.addEventListener('beforeinstallprompt', (event: any) => {
        event.preventDefault();
        this.promptEvent = event;
        this.openPromptComponent();
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

    timer(3000)
      .pipe(take(1))
      .subscribe(async () => await actionSheet.present());
  }
}
