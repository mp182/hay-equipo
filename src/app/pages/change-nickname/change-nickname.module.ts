import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ChangeNicknamePageRoutingModule } from './change-nickname-routing.module';

import { ChangeNicknamePage } from './change-nickname.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ChangeNicknamePageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [ChangeNicknamePage]
})
export class ChangeNicknamePageModule {}
