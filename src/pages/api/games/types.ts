import { Server } from "socket.io";

// Interface to represent the scores for each category and the total score
export interface Scores {
  [category: string]: number | undefined;
  total: number;
}

// Interface to represent the state of a Yahtzee game
export interface YahtzeeState {
  scores: { [player: string]: Scores }; // Scores for each player
  dice: number[]; // Current values of the dice
  heldDice: boolean[]; // Which dice are held
  rollsLeft: number; // Number of rolls left in the current turn
  currentPlayer: string; // The player whose turn it is
  gameOver: boolean; // Whether the game is over
}

// Interface to represent a game
export interface Game {
  id: string; // Unique identifier for the game
  name: string; // Name of the game
  host: string; // Username of the host
  players: string[]; // List of players in the game
  ready: boolean; // Whether the game is ready to start
  started: boolean; // Whether the game has started
  yahtzeeState: YahtzeeState | null; // The current state of the Yahtzee game
}

// Declare a global variable for the socket.io server instance
declare global {
  var _io: Server;
}