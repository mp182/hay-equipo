import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AsistenciasPageRoutingModule } from './asistencias-routing.module';

import { AsistenciasPage } from './asistencias.page';
import { SharedModule } from 'src/app/shared/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AsistenciasPageRoutingModule,
    SharedModule
  ],
  declarations: [AsistenciasPage]
})
export class AsistenciasPageModule {}
