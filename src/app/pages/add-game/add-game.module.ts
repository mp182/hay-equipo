import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddGamePageRoutingModule } from './add-game-routing.module';

import { AddGamePage } from './add-game.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddGamePageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [AddGamePage]
})
export class AddGamePageModule {}
