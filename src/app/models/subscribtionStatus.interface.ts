import { Player } from './player.interface';

export interface SubscriptionStatus {
    matchId: string; 
    players: Player[];
    subscribed: boolean;
    fullMatch: boolean;
    matchDate: any;
}