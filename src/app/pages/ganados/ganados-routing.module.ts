import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GanadosPage } from './ganados.page';

const routes: Routes = [
  {
    path: '',
    component: GanadosPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GanadosPageRoutingModule {}
