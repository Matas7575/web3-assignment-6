import { YahtzeeState, Scores } from "./types";

export const ALL_CATEGORIES = [
  "ones",
  "twos",
  "threes",
  "fours",
  "fives",
  "sixes",
  // Add other categories as needed
];

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
    dice: [0, 0, 0, 0, 0],
    heldDice: [false, false, false, false, false],
    rollsLeft: 3,
    currentPlayer: players[0],
    gameOver: false,
  };
}

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
