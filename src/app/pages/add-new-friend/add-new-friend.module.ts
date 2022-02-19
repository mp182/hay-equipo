import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddPlayerPageRoutingModule } from './add-new-friend-routing.module';

import { AddNewFriendPage } from './add-new-friend.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddPlayerPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [AddNewFriendPage]
})
export class AddNewFriendPageModule {}
