import { Server } from "socket.io";

export interface Scores {
  [category: string]: number | undefined;
  total: number;
}

export interface YahtzeeState {
  scores: { [player: string]: Scores };
  dice: number[];
  heldDice: boolean[];
  rollsLeft: number;
  currentPlayer: string;
  gameOver: boolean;
}

export interface Game {
  id: string;
  name: string;
  host: string;
  players: string[];
  ready: boolean;
  started: boolean;
  yahtzeeState: YahtzeeState | null;
}

declare global {
  var _io: Server;
}
