import { DecimalPipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';

import { Player } from 'src/app/models/player.interface';
import { playerScore } from 'src/app/helpers/score.helpers';

@Component({
  selector: 'app-score-number',
  templateUrl: './score-number.component.html',
  styleUrls: ['./score-number.component.scss'],
  imports: [DecimalPipe],
})
export class ScoreNumberComponent {

  readonly player = input.required<Pick<Player, 'played' | 'won'>>();

  readonly score = computed(() => playerScore(this.player()));

}
