import { Component, OnInit, Input, SimpleChanges, OnChanges } from '@angular/core';
import { Player } from 'src/app/models/player.interface';

@Component({
  selector: 'app-score',
  templateUrl: './score.component.html',
  styleUrls: ['./score.component.scss'],
})
export class ScoreComponent implements OnInit, OnChanges {

  @Input() player: Player;
  score: number;

  constructor() { }

  ngOnInit() {
    this.calculateScore(this.player);
  }

  ngOnChanges(changes: SimpleChanges) {
    const player = changes.player.currentValue;
    this.calculateScore(player);
  }

  private calculateScore(player: Player) {
    this.score = player.played === 0 || player.won === 0 ? 0 : player.won * 100 / player.played;
    this.score = player.played < 10 ? 50 : this.score;
  }

}
