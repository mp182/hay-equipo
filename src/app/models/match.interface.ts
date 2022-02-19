import { Player } from './player.interface';

export interface Match {
    id: string;
    date: any;
    enabled: boolean;
    maxPlayers: number;
    playersList: string[];
    subscribers: Player[];
    teamWhite: Player[];
    teamBlack: Player[];
    location: string;
    fullMatch: boolean;
    playerOn: boolean;
}