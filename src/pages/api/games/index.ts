import { NextApiRequest, NextApiResponse } from "next";
import { v4 as uuidv4 } from "uuid";
import { Game, YahtzeeState } from "./types";
import {
  handleJoin,
  handleStart,
  handleRollDice,
  handleHoldDice,
  handleScoreCategory,
} from "./handlers";
import { initializeYahtzeeState } from "./utils";

let games: Game[] = [];

/**
 * API handler function to manage different HTTP methods.
 * 
 * @param {NextApiRequest} req - The API request object.
 * @param {NextApiResponse} res - The API response object.
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  switch (method) {
    case "GET":
      return handleGet(req, res);
    case "POST":
      return handlePost(req, res);
    case "PUT":
      return handlePut(req, res);
    default:
      res.setHeader("Allow", ["GET", "POST", "PUT"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}

/**
 * Handles GET requests to fetch game information.
 * 
 * @param {NextApiRequest} req - The API request object.
 * @param {NextApiResponse} res - The API response object.
 */
function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const { gameId } = req.query;

  // If gameId is provided, return specific game
  if (gameId && typeof gameId === "string") {
    const game = games.find((g) => g.id === gameId);
    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }
    return res.status(200).json(game);
  }

  // Otherwise return all available (not started) games
  const availableGames = games.filter(game => !game.started);
  return res.status(200).json(availableGames);
}

/**
 * Handles POST requests to create a new game.
 * 
 * @param {NextApiRequest} req - The API request object.
 * @param {NextApiResponse} res - The API response object.
 */
function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const { username } = req.body;

  if (typeof username !== "string" || username.trim() === "") {
    return res.status(400).json({ 
      error: "Username is required and must be a non-empty string" 
    });
  }

  const newGame: Game = {
    id: uuidv4(),
    name: `${username}'s Game`,
    host: username,
    players: [username],
    ready: false,
    started: false,
    yahtzeeState: null,
  };

  games.push(newGame);

  // Emit update to all clients
  if (global._io) {
    global._io.emit("gameUpdate", { type: "update", game: newGame });
  }

  res.status(201).json(newGame);
}

/**
 * Handles PUT requests to update game state.
 * 
 * @param {NextApiRequest} req - The API request object.
 * @param {NextApiResponse} res - The API response object.
 */
function handlePut(req: NextApiRequest, res: NextApiResponse) {
  const { gameId, username, action, category, diceIndexes } = req.body;

  // Validate basic request parameters
  if (typeof gameId !== "string" || gameId.trim() === "") {
    return res.status(400).json({ 
      error: "gameId is required and must be a non-empty string" 
    });
  }
  if (typeof username !== "string" || username.trim() === "") {
    return res.status(400).json({ 
      error: "username is required and must be a non-empty string" 
    });
  }
  if (typeof action !== "string" || action.trim() === "") {
    return res.status(400).json({ 
      error: "action is required and must be a non-empty string" 
    });
  }

  // Find the game
  const game = games.find((g) => g.id === gameId);
  if (!game) {
    return res.status(404).json({ error: "Game not found" });
  }

  // Route to appropriate handler based on action
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