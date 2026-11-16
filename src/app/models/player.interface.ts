export interface Player {
    id: string;
    /** Solo el del jugador logueado (sale de su cuenta de Google, no se guarda en Firestore). */
    email?: string;
    googleLogin: boolean;
    image: string;
    lastGames: string[];
    nickname: string;
    played: number;
    roles: string[];
    won: number;
    /** Solo en los anotados de un partido: uid de quien anotó a este amigo ('' si se anotó solo). */
    friendOf?: string;
    /** `true` para los amigos que no tienen cuenta propia. */
    friend?: boolean;
}
