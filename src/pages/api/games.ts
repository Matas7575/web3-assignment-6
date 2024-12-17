// pages/api/games.ts

import { NextApiRequest, NextApiResponse } from "next";
import { v4 as uuidv4 } from "uuid";
// Define TypeScript interfaces for better type safety

interface Scores {
  [category: string]: number | undefined;
  total: number;
}

interface YahtzeeState {
  scores: { [player: string]: Scores };
  dice: number[];
  heldDice: boolean[];
  rollsLeft: number;
  currentPlayer: string;
  gameOver: boolean;
}

interface Game {
  id: string;
  name: string;
  host: string;
  players: string[];
  ready: boolean;
  started: boolean;
  yahtzeeState: YahtzeeState | null;
}

// In-memory storage for games
let games: Game[] = [];

declare global {
  var _io: import("socket.io").Server;
  // var notifyGameUpdate: (game: Game) => void;
}

// Define all valid categories
const ALL_CATEGORIES = [
  "ones",
  "twos",
  "threes",
  "fours",
  "fives",
  "sixes",
  // Add other categories as needed, e.g., "fullHouse", "smallStraight", etc.
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  switch (method) {
    case "GET":
      handleGet(req, res);
      break;
    case "POST":
      handlePost(req, res);
      break;
    case "PUT":
      handlePut(req, res);
      break;
    default:
      res.setHeader("Allow", ["GET", "POST", "PUT"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}

/**
 * Handle GET requests
 * - If gameId is provided, return the specific game
 * - Otherwise, return all games
 */
function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const { gameId } = req.query;

  if (gameId && typeof gameId === "string") {
    const game = games.find((g) => g.id === gameId);
    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }
    return res.status(200).json(game);
  }

  return res.status(200).json(games);
}

/**
 * Handle POST requests
 * - Create a new game with the provided username as the host
 */
function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const { username } = req.body;

  // Validate username
  if (typeof username !== "string" || username.trim() === "") {
    return res
      .status(400)
      .json({ error: "Username is required and must be a non-empty string" });
  }

  // Create a new game
  const newGame: Game = {
    id: uuidv4(), // Use uuid to generate a unique ID
    name: `${username}'s Game`,
    host: username,
    players: [username],
    ready: false,
    started: false,
    yahtzeeState: null,
  };

  // Add the new game to the in-memory storage
  games.push(newGame);

  // After handling a game update in your API
  if (global._io) {
    // Emit to all clients for the Home page to receive lobby updates
    global._io.emit("gameUpdate", { type: "update", game: newGame });

    // Also emit to specific game rooms if needed
    // global._io.to(game.id).emit("gameUpdate", { type: "update", game });
  }

  // Respond with the newly created game
  res.status(201).json(newGame);
}

/**
 * Handle PUT requests
 * - Perform actions such as join, start, rollDice, holdDice, scoreCategory
 */
function handlePut(req: NextApiRequest, res: NextApiResponse) {
  const { gameId, username, action, category, diceIndexes } = req.body;

  // Validate required fields
  if (typeof gameId !== "string" || gameId.trim() === "") {
    return res
      .status(400)
      .json({ error: "gameId is required and must be a non-empty string" });
  }
  if (typeof username !== "string" || username.trim() === "") {
    return res
      .status(400)
      .json({ error: "username is required and must be a non-empty string" });
  }
  if (typeof action !== "string" || action.trim() === "") {
    return res
      .status(400)
      .json({ error: "action is required and must be a non-empty string" });
  }

  // Find the game by gameId
  const game = games.find((g) => g.id === gameId);
  if (!game) {
    return res.status(404).json({ error: "Game not found" });
  }

  // Handle actions based on the 'action' field
  switch (action) {
    case "join":
      return handleJoin(game, username, res);
    case "start":
      return handleStart(game, username, res);
    case "rollDice":
      return handleRollDice(game, username, res);
    case "holdDice":
      return handleHoldDice(game, username, diceIndexes, res);
    case "scoreCategory":
      return handleScoreCategory(game, username, category, res);
    default:
      return res.status(400).json({ error: "Invalid action" });
  }
}

/**
 * Handle 'join' action
 */
function handleJoin(game: Game, username: string, res: NextApiResponse) {
  // Check if user is already in the game
  if (game.players.includes(username)) {
    return res.status(400).json({ error: "User already in the game" });
  }

  // Add user to the game
  game.players.push(username);
  game.ready = game.players.length >= 2;
  console.log(`${username} joined game ${game.id}`);

  // Notify all connected clients about the update
  if (global._io) {
    global._io.to(game.id).emit("gameUpdate", { type: "update", game });
    global._io.emit("gameUpdate", { type: "update", game });
  }

  // Respond with the updated game
  return res.status(200).json(game);
}

/**
 * Handle 'start' action
 */
function handleStart(game: Game, username: string, res: NextApiResponse) {
  // Only the host can start the game
  if (game.host !== username) {
    return res.status(403).json({ error: "Only the host can start the game" });
  }

  // Ensure there are enough players to start the game
  if (game.players.length < 2) {
    return res.status(400).json({
      error: "At least 2 players are required to start the game",
    });
  }

  // Check if the game has already started
  if (game.started) {
    return res.status(400).json({ error: "Game has already started" });
  }

  // Initialize the game state
  game.started = true;
  game.yahtzeeState = initializeYahtzeeState(game.players);

  // Notify all connected clients about the update
  if (global._io) {
    global._io.to(game.id).emit("gameUpdate", { type: "update", game });
  }

  // Respond with the updated game
  return res.status(200).json(game);
}

/**
 * Handle 'rollDice' action
 */
function handleRollDice(game: Game, username: string, res: NextApiResponse) {
  if (!game.started || !game.yahtzeeState) {
    return res.status(400).json({ error: "Game has not started yet" });
  }

  // Ensure it's the player's turn
  if (game.yahtzeeState.currentPlayer !== username) {
    return res.status(403).json({ error: "Not your turn!" });
  }

  // Check if the player has rolls left
  if (game.yahtzeeState.rollsLeft <= 0) {
    return res.status(400).json({ error: "No rolls left!" });
  }

  // Roll the dice that are not held
  game.yahtzeeState.dice = game.yahtzeeState.dice.map((die, index) =>
    game.yahtzeeState!.heldDice[index] ? die : Math.ceil(Math.random() * 6)
  );

  // Decrement the number of rolls left
  game.yahtzeeState.rollsLeft -= 1;

  // Notify all connected clients about the update
  if (global._io) {
    global._io.to(game.id).emit("gameUpdate", { type: "update", game });
  }

  // Respond with the updated game
  return res.status(200).json(game);
}

/**
 * Handle 'holdDice' action
 */
function handleHoldDice(
  game: Game,
  username: string,
  diceIndexes: any,
  res: NextApiResponse
) {
  if (!game.started || !game.yahtzeeState) {
    return res.status(400).json({ error: "Game has not started yet" });
  }

  // Ensure it's the player's turn
  if (game.yahtzeeState.currentPlayer !== username) {
    return res.status(403).json({ error: "Not your turn!" });
  }

  // Validate diceIndexes
  if (
    !Array.isArray(diceIndexes) ||
    !diceIndexes.every(
      (index: any) => typeof index === "number" && index >= 0 && index < 5
    )
  ) {
    return res.status(400).json({
      error: "diceIndexes must be an array of numbers between 0 and 4",
    });
  }

  // Toggle the hold status of specified dice
  diceIndexes.forEach((index: number) => {
    game.yahtzeeState!.heldDice[index] = !game.yahtzeeState!.heldDice[index];
  });

  // Notify all connected clients about the update
  if (global._io) {
    global._io.to(game.id).emit("gameUpdate", { type: "update", game });
  }

  // Respond with the updated game
  return res.status(200).json(game);
}

/**
 * Handle 'scoreCategory' action
 */
function handleScoreCategory(
  game: Game,
  username: string,
  category: any,
  res: NextApiResponse
) {
  if (!game.started || !game.yahtzeeState) {
    return res.status(400).json({ error: "Game has not started yet" });
  }

  // Ensure it's the player's turn
  if (game.yahtzeeState.currentPlayer !== username) {
    return res.status(403).json({ error: "Not your turn!" });
  }

  // Validate category
  if (typeof category !== "string" || category.trim() === "") {
    return res.status(400).json({
      error: "category is required and must be a non-empty string",
    });
  }

  if (!ALL_CATEGORIES.includes(category)) {
    return res.status(400).json({ error: "Invalid category" });
  }

  // Initialize player's scores if not present
  if (!game.yahtzeeState.scores[username]) {
    game.yahtzeeState.scores[username] = { total: 0 };
  }

  // Check if the category has already been scored
  if (game.yahtzeeState.scores[username][category] !== undefined) {
    return res.status(400).json({ error: "Category already scored!" });
  }

  // Calculate the score for the category
  const score = calculateScore(category, game.yahtzeeState.dice);
  game.yahtzeeState.scores[username][category] = score;

  // Update total score
  const totalScore = Object.entries(game.yahtzeeState.scores[username])
    .filter(([cat]) => cat !== "total")
    .reduce((sum, [_, catScore]) => sum + (catScore || 0), 0);
  game.yahtzeeState.scores[username].total = totalScore;

  // Reset dice and advance turn
  game.yahtzeeState.rollsLeft = 3;
  game.yahtzeeState.dice = [0, 0, 0, 0, 0];
  game.yahtzeeState.heldDice = [false, false, false, false, false];

  const currentIndex = game.players.indexOf(game.yahtzeeState.currentPlayer);
  game.yahtzeeState.currentPlayer =
    game.players[(currentIndex + 1) % game.players.length];

  // **Updated Game Over Condition**
  const allPlayersScored = game.players.every((player) => {
    const playerScores = game.yahtzeeState!.scores[player];
    return ALL_CATEGORIES.every((cat) => playerScores[cat] !== undefined);
  });

  if (allPlayersScored) {
    game.yahtzeeState.gameOver = true;
  }

  // Notify all connected clients about the update
  if (global._io) {
    global._io.to(game.id).emit("gameUpdate", { type: "update", game });
  }

  // Respond with the updated game
  return res.status(200).json(game);
}

/**
 * Initialize the Yahtzee game state for all players
 */
function initializeYahtzeeState(players: string[]): YahtzeeState {
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

/**
 * Calculate the score for a given category based on the dice rolled
 */
function calculateScore(category: string, dice: number[]): number {
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
