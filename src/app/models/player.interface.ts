export interface Player {
    id: string;
    email: string;
    googleLogin: boolean;
    image: string;
    lastGames: string[];
    nickname: string;
    played: number;
    roles: string[];
    won: number;
}
