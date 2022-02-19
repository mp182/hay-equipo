import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddFriendPageRoutingModule } from './add-friend-routing.module';

import { AddFriendPage } from './add-friend.page';
import { SharedModule } from 'src/app/shared/shared/shared.module';
import { AddNewFriendPageModule } from '../add-new-friend/add-new-friend.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddFriendPageRoutingModule,
    SharedModule,
    AddNewFriendPageModule
  ],
  declarations: [AddFriendPage]
})
export class AddFriendPageModule {}
