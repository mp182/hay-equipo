import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NewSeasonPage } from './new-season.page';

const routes: Routes = [
  {
    path: '',
    component: NewSeasonPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NewSeasonPageRoutingModule {}
