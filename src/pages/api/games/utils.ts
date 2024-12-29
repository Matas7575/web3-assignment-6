import { YahtzeeState, Scores } from "./types";

// Array of all possible scoring categories in Yahtzee
export const ALL_CATEGORIES = [
  "ones",
  "twos",
  "threes",
  "fours",
  "fives",
  "sixes",
  // Add other categories as needed
];

/**
 * Initializes the state of a Yahtzee game for the given players.
 * 
 * @param {string[]} players - Array of player usernames.
 * @returns {YahtzeeState} - The initial state of the Yahtzee game.
 */
export function initializeYahtzeeState(players: string[]): YahtzeeState {
  return {
    scores: players.reduce((acc, player) => {
      acc[player] = ALL_CATEGORIES.reduce((scoreAcc, category) => {
        scoreAcc[category] = undefined;
        return scoreAcc;
      }, {} as Scores);
      acc[player].total = 0;
      return acc;
    }, {} as { [player: string]: Scores }),
    dice: [0, 0, 0, 0, 0], // Initial dice values
    heldDice: [false, false, false, false, false], // Initial held dice states
    rollsLeft: 3, // Number of rolls left in the current turn
    currentPlayer: players[0], // The player whose turn it is
    gameOver: false, // Whether the game is over
  };
}

/**
 * Calculates the score for a given category based on the current dice values.
 * 
 * @param {string} category - The scoring category.
 * @param {number[]} dice - The current values of the dice.
 * @returns {number} - The calculated score for the category.
 */
export function calculateScore(category: string, dice: number[]): number {
  switch (category) {
    case "ones":
      return dice.filter((d) => d === 1).length * 1;
    case "twos":
      return dice.filter((d) => d === 2).length * 2;
    case "threes":
      return dice.filter((d) => d === 3).length * 3;
    case "fours":
      return dice.filter((d) => d === 4).length * 4;
    case "fives":
      return dice.filter((d) => d === 5).length * 5;
    case "sixes":
      return dice.filter((d) => d === 6).length * 6;
    // Implement additional categories as needed
    default:
      return 0;
  }
}