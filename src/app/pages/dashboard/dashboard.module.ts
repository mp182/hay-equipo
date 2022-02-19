import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DashboardPageRoutingModule } from './dashboard-routing.module';

import { DashboardPage } from './dashboard.page';
import { SharedModule } from 'src/app/shared/shared/shared.module';
import { UpdatePageModule } from '../update/update.module';
import { NewsCardComponent } from 'src/app/components/news-card/news-card.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DashboardPageRoutingModule,
    SharedModule,
    UpdatePageModule
  ],
  declarations: [DashboardPage, NewsCardComponent]
})
export class DashboardPageModule {}
