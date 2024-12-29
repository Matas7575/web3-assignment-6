import { NextApiResponse } from "next";
import { Game } from "./types";
import {
  ALL_CATEGORIES,
  calculateScore,
  initializeYahtzeeState,
} from "./utils";

/**
 * Interface for a category object.
 * 
 * @interface Category
 * @property {string} category - The category name.
 * @property {unknown} [key] - Additional category data.
 * @category Types
 */
interface Category {
  category: string;
  [key: string]: unknown;
}

/**
 * Handles a player joining a game.
 * 
 * @param {Game} game - The game object.
 * @param {string} username - The username of the player joining.
 * @param {NextApiResponse} res - The API response object.
 * @returns {NextApiResponse} - The API response.
 */
export const handleJoin = (
  game: Game,
  username: string,
  res: NextApiResponse
) => {
  // Validate inputs
  if (!game || !username) {
    return res.status(400).json({ error: "Invalid game or username" });
  }

  // Check if player is already in the game
  if (game.players.includes(username)) {
    return res.status(400).json({ error: "User already in the game" });
  }

  // Check if game has already started
  if (game.started) {
    return res.status(400).json({ error: "Game has already started" });
  }

  // Add player to the game
  game.players.push(username);
  
  // Update game ready status
  game.ready = game.players.length >= 2;

  // Emit update to all clients
  if (global._io) {
    // Emit to the specific game room
    global._io.to(game.id).emit("gameUpdate", { 
      type: "update", 
      game 
    });
    
    // Emit to all clients to update lobby list
    global._io.emit("gameUpdate", { 
      type: "update", 
      game 
    });
  }

  // Log the update
  console.log(`Player ${username} joined game ${game.id}`);
  console.log('Current players:', game.players);

  return res.status(200).json(game);
};

/**
 * Handles starting a game.
 * 
 * @param {Game} game - The game object.
 * @param {string} username - The username of the player starting the game.
 * @param {NextApiResponse} res - The API response object.
 * @returns {NextApiResponse} - The API response.
 */
export const handleStart = (
  game: Game,
  username: string,
  res: NextApiResponse
) => {
  if (game.host !== username) {
    return res.status(403).json({ error: "Only the host can start the game" });
  }

  if (game.players.length < 2) {
    return res.status(400).json({
      error: "At least 2 players are required to start the game",
    });
  }

  if (game.started) {
    return res.status(400).json({ error: "Game has already started" });
  }

  game.started = true;
  game.yahtzeeState = initializeYahtzeeState(game.players);

  if (global._io) {
    global._io.to(game.id).emit("gameUpdate", { type: "update", game });
  }

  return res.status(200).json(game);
};

/**
 * Handles rolling the dice in a game.
 * 
 * @param {Game} game - The game object.
 * @param {string} username - The username of the player rolling the dice.
 * @param {NextApiResponse} res - The API response object.
 * @returns {NextApiResponse} - The API response.
 */
export const handleRollDice = (
  game: Game,
  username: string,
  res: NextApiResponse
) => {
  if (!game.started || !game.yahtzeeState) {
    return res.status(400).json({ error: "Game has not started yet" });
  }

  if (game.yahtzeeState.currentPlayer !== username) {
    return res.status(403).json({ error: "Not your turn!" });
  }

  if (game.yahtzeeState.rollsLeft <= 0) {
    return res.status(400).json({ error: "No rolls left!" });
  }

  // If this is the first roll of the turn, reset held dice
  if (!game.yahtzeeState.turnStarted) {
    game.yahtzeeState.heldDice = [false, false, false, false, false];
  }

  // Roll the dice
  game.yahtzeeState.dice = game.yahtzeeState.dice.map((_, index) =>
    game.yahtzeeState!.heldDice[index] ? game.yahtzeeState!.dice[index] : Math.ceil(Math.random() * 6)
  );

  game.yahtzeeState.rollsLeft -= 1;
  game.yahtzeeState.turnStarted = true; // Mark that the turn has started

  if (global._io) {
    global._io.to(game.id).emit("gameUpdate", { type: "update", game });
  }

  return res.status(200).json(game);
};

/**
 * Handles holding dice in a game.
 * 
 * @param {Game} game - The game object.
 * @param {string} username - The username of the player holding the dice.
 * @param {number[]} diceIndexes - The indexes of the dice to hold.
 * @param {NextApiResponse} res - The API response object.
 * @returns {NextApiResponse} - The API response.
 */
export const handleHoldDice = (
  game: Game,
  username: string,
  diceIndexes: number[],
  res: NextApiResponse
) => {
  if (!game.started || !game.yahtzeeState) {
    return res.status(400).json({ error: "Game has not started yet" });
  }

  if (game.yahtzeeState.currentPlayer !== username) {
    return res.status(403).json({ error: "Not your turn!" });
  }

  if (!game.yahtzeeState.turnStarted) {
    return res.status(400).json({ error: "Must roll dice before holding" });
  }

  if (
    !Array.isArray(diceIndexes) ||
    !diceIndexes.every((index) => typeof index === "number" && index >= 0 && index < 5)
  ) {
    return res.status(400).json({
      error: "diceIndexes must be an array of numbers between 0 and 4",
    });
  }

  diceIndexes.forEach((index) => {
    if (game.yahtzeeState!.dice[index] !== 0) { // Only allow holding dice that have been rolled
      game.yahtzeeState!.heldDice[index] = !game.yahtzeeState!.heldDice[index];
    }
  });

  if (global._io) {
    global._io.to(game.id).emit("gameUpdate", { type: "update", game });
  }

  return res.status(200).json(game);
};

/**
 * Handles scoring a category in a game.
 * 
 * @param {Game} game - The game object.
 * @param {string} username - The username of the player scoring the category.
 * @param {string} category - The category to score.
 * @param {NextApiResponse} res - The API response object.
 * @returns {NextApiResponse} - The API response.
 */
export const handleScoreCategory = (
  game: Game,
  username: string,
  category: string,
  res: NextApiResponse
) => {
  if (!game.started || !game.yahtzeeState) {
    return res.status(400).json({ error: "Game has not started yet" });
  }

  if (game.yahtzeeState.currentPlayer !== username) {
    return res.status(403).json({ error: "Not your turn!" });
  }

  if (typeof category !== "string" || category.trim() === "") {
    return res.status(400).json({
      error: "category is required and must be a non-empty string",
    });
  }

  if (!ALL_CATEGORIES.includes(category)) {
    return res.status(400).json({ error: "Invalid category" });
  }

  if (!game.yahtzeeState?.scores[username]) {
    game.yahtzeeState.scores[username] = { total: 0 };
  }

  if (game.yahtzeeState.scores[username][category] !== undefined) {
    return res.status(400).json({ error: "Category already scored!" });
  }

  const score = calculateScore(category, game.yahtzeeState.dice);
  game.yahtzeeState.scores[username][category] = score;

  const totalScore = Object.entries(game.yahtzeeState.scores[username])
    .filter(([cat]) => cat !== "total")
    .reduce((sum, [_, catScore]) => sum + (catScore || 0), 0);
  game.yahtzeeState.scores[username].total = totalScore;

  game.yahtzeeState.rollsLeft = 3;
  game.yahtzeeState.dice = [0, 0, 0, 0, 0];
  game.yahtzeeState.heldDice = [false, false, false, false, false];

  const currentIndex = game.players.indexOf(game.yahtzeeState.currentPlayer);
  game.yahtzeeState.currentPlayer =
    game.players[(currentIndex + 1) % game.players.length];

  const allPlayersScored = game.players.every((player) => {
    const playerScores = game.yahtzeeState!.scores[player];
    return ALL_CATEGORIES.every((cat) => playerScores[cat] !== undefined);
  });

  if (allPlayersScored) {
    game.yahtzeeState.gameOver = true;
  }

  if (global._io) {
    global._io.to(game.id).emit("gameUpdate", { type: "update", game });
  }

  return res.status(200).json(game);
};