import { Component, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-about',
  templateUrl: './about.page.html',
  styleUrls: ['./about.page.scss'],
})
export class AboutPage implements OnInit {

  public version = environment.version;

  constructor(
    private menuCtrl: MenuController
  ) { }

  ngOnInit() {
    this.menuCtrl.close();
  }

}
