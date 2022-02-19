import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ChangeNicknamePage } from './change-nickname.page';

const routes: Routes = [
  {
    path: '',
    component: ChangeNicknamePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ChangeNicknamePageRoutingModule {}
