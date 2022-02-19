import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RankingTabsPageRoutingModule } from './ranking-tabs-routing.module';

import { RankingTabsPage } from './ranking-tabs.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RankingTabsPageRoutingModule
  ],
  declarations: [RankingTabsPage]
})
export class RankingTabsPageModule {}
