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

function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const { username } = req.body;

  if (typeof username !== "string" || username.trim() === "") {
    return res
      .status(400)
      .json({ error: "Username is required and must be a non-empty string" });
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

  if (global._io) {
    global._io.emit("gameUpdate", { type: "update", game: newGame });
  }

  res.status(201).json(newGame);
}

function handlePut(req: NextApiRequest, res: NextApiResponse) {
  const { gameId, username, action, category, diceIndexes } = req.body;

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

  const game = games.find((g) => g.id === gameId);
  if (!game) {
    return res.status(404).json({ error: "Game not found" });
  }

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
