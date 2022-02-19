import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GanadosPageRoutingModule } from './ganados-routing.module';

import { GanadosPage } from './ganados.page';
import { SharedModule } from 'src/app/shared/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GanadosPageRoutingModule,
    SharedModule
  ],
  declarations: [GanadosPage]
})
export class GanadosPageModule {}
