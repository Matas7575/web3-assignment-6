import { NextApiRequest, NextApiResponse } from "next";

type YahtzeeState = {
  turn: number;
  scores: Record<
    string,
    {
      upper: Record<string, number>;
      lower: Record<string, number>;
      total: number;
    }
  >;
  dice: number[];
  rollsLeft: number;
  currentPlayer: string;
};

let games: {
  id: string;
  name: string;
  host: string;
  players: string[];
  ready: boolean;
  started: boolean;
  yahtzeeState: YahtzeeState | null;
}[] = [];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    res.status(200).json(games);
  } else if (req.method === "POST") {
    const { username } = req.body;
    if (!username) {
      return res.status(400).json({ error: "Username is required" });
    }

    const newGame = {
      id: `${Date.now()}`,
      name: `${username}'s Game`,
      host: username,
      players: [username],
      ready: false,
      started: false,
      yahtzeeState: null,
    };

    games.push(newGame);
    res.status(201).json(newGame);
  } else if (req.method === "PUT") {
    const { gameId, username, action } = req.body;

    if (!gameId || !username || !action) {
      return res
        .status(400)
        .json({ error: "gameId, username, and action are required" });
    }

    const game = games.find((g) => g.id === gameId);
    if (!game) {
      return res
        .status(404)
        .json({ error: `Game with ID ${gameId} not found` });
    }

    if (action === "join") {
      if (game.players.includes(username)) {
        return res
          .status(400)
          .json({ error: `Player ${username} is already in the game` });
      }
      game.players.push(username);
      if (game.players.length >= 2) {
        game.ready = true;
      }
    } else if (action === "start") {
      if (game.host !== username) {
        return res
          .status(403)
          .json({ error: "Only the host can start the game" });
      }
      if (game.players.length < 2) {
        return res
          .status(400)
          .json({ error: "At least 2 players are required to start the game" });
      }
      game.started = true;
      game.yahtzeeState = initializeYahtzeeState(game.players);
    }

    res.status(200).json(game);
  } else {
    res.setHeader("Allow", ["GET", "POST", "PUT"]);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}

function initializeYahtzeeState(players: string[]): YahtzeeState {
  return {
    turn: 0,
    scores: players.reduce((acc: Record<string, any>, player: string) => {
      acc[player] = { upper: {}, lower: {}, total: 0 };
      return acc;
    }, {}),
    dice: [1, 1, 1, 1, 1],
    rollsLeft: 3,
    currentPlayer: players[0],
  };
}
