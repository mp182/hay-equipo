import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScoreComponent } from 'src/app/components/score/score.component';
import { IonicModule } from '@ionic/angular';
import { SafeImageDirective } from 'src/app/directives/safe-image.directive';
import { ScoreNumberComponent } from 'src/app/components/score-number/score-number.component';

@NgModule({
  declarations: [
    ScoreComponent,
    ScoreNumberComponent,
    SafeImageDirective
  ],
  imports: [
    CommonModule,
    IonicModule
  ],
  exports: [
    ScoreComponent,
    ScoreNumberComponent,
    SafeImageDirective
  ]
})
export class SharedModule { }
