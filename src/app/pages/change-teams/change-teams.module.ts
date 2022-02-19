import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ChangeTeamsPageRoutingModule } from './change-teams-routing.module';

import { ChangeTeamsPage } from './change-teams.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ChangeTeamsPageRoutingModule
  ],
  declarations: [ChangeTeamsPage]
})
export class ChangeTeamsPageModule {}
