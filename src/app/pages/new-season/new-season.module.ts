import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NewSeasonPageRoutingModule } from './new-season-routing.module';

import { NewSeasonPage } from './new-season.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NewSeasonPageRoutingModule
  ],
  declarations: [NewSeasonPage]
})
export class NewSeasonPageModule {}
