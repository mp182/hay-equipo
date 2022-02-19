import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RankingTabsPage } from './ranking-tabs.page';

const routes: Routes = [
  {
    path: '',
    component: RankingTabsPage,
    children: [
      {
        path: 'ranking',
        loadChildren: () => import('../ranking/ranking.module').then( m => m.RankingPageModule)
      },
      {
        path: 'asistencias',
        loadChildren: () => import('../asistencias/asistencias.module').then( m => m.AsistenciasPageModule)
      },
      {
        path: 'ganados',
        loadChildren: () => import('../ganados/ganados.module').then( m => m.GanadosPageModule)
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RankingTabsPageRoutingModule {}
