import { Injectable } from '@angular/core';
import { Player } from '../models/player.interface';
import { Subscription } from 'rxjs';
import { DbService } from './db.service';

@Injectable({
  providedIn: 'root'
})
export class RankingTabsService {

  players: Player[];
  playersSubscription: Subscription;
  tabsNavigation = false;

  constructor(
    private db: DbService
  ) {
    this.playersSubscription = this.db.getPlayers().subscribe(players => {
      if (players) {
        this.players = players;
      }
    });
  }

}
