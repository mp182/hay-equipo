import { DecimalPipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { IonIcon } from '@ionic/angular';

import { Player } from 'src/app/models/player.interface';
import { playerScore } from 'src/app/helpers/score.helpers';

@Component({
  selector: 'app-score',
  templateUrl: './score.component.html',
  styleUrls: ['./score.component.scss'],
  imports: [DecimalPipe, IonIcon],
})
export class ScoreComponent {

  readonly player = input.required<Pick<Player, 'played' | 'won'>>();

  readonly score = computed(() => playerScore(this.player()));

  readonly icon = computed(() => {
    const score = this.score();
    if (score >= 90) { return 'rocket-outline'; }
    if (score >= 70) { return 'star'; }
    if (score >= 40) { return 'star-half'; }
    return 'star-outline';
  });

}
