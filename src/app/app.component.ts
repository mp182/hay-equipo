import { Component } from '@angular/core';
import { Platform, MenuController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { AuthenticationService } from './services/authentication.service';
import { Player } from './models/player.interface';
import { ConnectionService } from 'ng-connection-service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {

  user$: Observable<Player>;

  constructor(
    private authService: AuthenticationService,
    private connectionService: ConnectionService,
    private menuCtrl: MenuController,
    private platform: Platform,
    private router: Router,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar
  ) {
    this.initializeApp();

    this.user$ = this.authService.player$;

    this.connectionService.monitor().subscribe(isConnected => {
      if (isConnected) {
        this.router.navigateByUrl('dashboard');
      } else {
        this.router.navigateByUrl('no-internet');
      }
    });
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  logout() {
    this.authService.logoutUser()
      .then(() => {
        this.router.navigateByUrl('login');
      })
      .catch(error => {
        console.log(error);
      });
  }

  editNickname() {
    this.router.navigate(['change-nickname']);
    this.menuCtrl.close();
  }

  editImage() {
    this.router.navigate(['edit-image']);
    this.menuCtrl.close();
  }

}
