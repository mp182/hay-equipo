import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ChangeTeamsPage } from './change-teams.page';

const routes: Routes = [
  {
    path: '',
    component: ChangeTeamsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ChangeTeamsPageRoutingModule {}
