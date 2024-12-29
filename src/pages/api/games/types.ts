/**
 * Represents the scores for a player in the Yahtzee game.
 * Each category can either have a number value or be undefined if not yet scored.
 * 
 * @example
 * const playerScores: Scores = {
 *   ones: 3,
 *   twos: 8,
 *   threes: undefined, // Not yet scored
 *   total: 11
 * };
 */
export interface Scores {
  /** Individual category scores can be either a number or undefined if not yet scored */
  [category: string]: number | undefined;
  /** The total score for the player, automatically calculated */
  total: number;
}

/**
 * Represents the current state of dice in the game.
 * Contains information about dice values, which dice are held, and roll status.
 * 
 * @example
 * const diceState: DiceState = {
 *   values: [1, 3, 3, 4, 6],
 *   held: [false, true, true, false, false],
 *   rollsLeft: 2
 * };
 */
export interface DiceState {
  /** Array of current dice values (1-6) */
  values: number[];
  /** Array of booleans indicating which dice are held */
  held: boolean[];
  /** Number of rolls remaining in the current turn */
  rollsLeft: number;
}

/**
 * Represents the complete state of a Yahtzee game.
 * Tracks all game-related information including scores, dice, and turn status.
 * 
 * @example
 * const gameState: YahtzeeState = {
 *   scores: {
 *     "player1": { ones: 3, twos: 8, total: 11 },
 *     "player2": { ones: 4, twos: 6, total: 10 }
 *   },
 *   dice: [1, 3, 3, 4, 6],
 *   heldDice: [false, true, true, false, false],
 *   rollsLeft: 2,
 *   currentPlayer: "player1",
 *   gameOver: false,
 *   turnStarted: true,
 *   round: 1
 * };
 */
export interface YahtzeeState {
  /** Record of scores for each player */
  scores: { [player: string]: Scores };
  /** Current values showing on the dice */
  dice: number[];
  /** Which dice are currently held */
  heldDice: boolean[];
  /** Number of rolls remaining in current turn */
  rollsLeft: number;
  /** Username of the player whose turn it is */
  currentPlayer: string;
  /** Whether the game has ended */
  gameOver: boolean;
  /** Whether the current turn has started (first roll made) */
  turnStarted: boolean;
  /** Current round number */
  round: number;
}

/**
 * Represents a game lobby and its current state.
 * Contains all information about the game, players, and current game state.
 * 
 * @example
 * const game: Game = {
 *   id: "game123",
 *   name: "John's Game",
 *   host: "john",
 *   players: ["john", "jane"],
 *   ready: true,
 *   started: false,
 *   yahtzeeState: null
 * };
 */
export interface Game {
  /** Unique identifier for the game */
  id: string;
  /** Display name for the game lobby */
  name: string;
  /** Username of the player who created the game */
  host: string;
  /** Array of usernames of players in the game */
  players: string[];
  /** Whether enough players have joined to start */
  ready: boolean;
  /** Whether the game has been started */
  started: boolean;
  /** Current state of the Yahtzee game, null if not started */
  yahtzeeState: YahtzeeState | null;
}

/**
 * Valid categories for scoring in Yahtzee.
 * Used to ensure type safety when referencing score categories.
 * 
 * @example
 * const category: ScoreCategory = "ones";
 */
export type ScoreCategory = 
  | "ones" 
  | "twos" 
  | "threes" 
  | "fours" 
  | "fives" 
  | "sixes";

/**
 * Array of all possible scoring categories.
 * Useful for iterating through categories or validation.
 * 
 * @example
 * ALL_CATEGORIES.forEach(category => {
 *   console.log(`Checking score for ${category}`);
 * });
 */
export const ALL_CATEGORIES: ScoreCategory[] = [
  "ones",
  "twos",
  "threes",
  "fours",
  "fives",
  "sixes"
];