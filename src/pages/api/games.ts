import { NextApiRequest, NextApiResponse } from "next";

let games: {
  id: string;
  name: string;
  host: string;
  players: string[];
  ready: boolean;
  started: boolean;
  yahtzeeState: any | null;
}[] = []; // In-memory storage

const ALL_CATEGORIES = [
  "ones",
  "twos",
  "threes",
  "fours",
  "fives",
  "sixes",
  // Add other categories, e.g., "fullHouse", "smallStraight", etc.
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  if (method === "GET") {
    const { gameId } = req.query;
    if (gameId) {
      const game = games.find((g) => g.id === gameId);
      if (!game) {
        return res.status(404).json({ error: "Game not found" });
      }
      return res.status(200).json(game);
    }
    return res.status(200).json(games);
  } else if (method === "POST") {
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
  } else if (method === "PUT") {
    const { gameId, username, action, category, diceIndexes } = req.body;
    const game = games.find((g) => g.id === gameId);

    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }

    switch (action) {
      case "join":
        if (!username || game.players.includes(username)) {
          return res.status(400).json({ error: "Invalid join request" });
        }
        game.players.push(username);
        game.ready = game.players.length >= 2;
        return res.status(200).json(game);

      case "start":
        if (game.host !== username) {
          return res
            .status(403)
            .json({ error: "Only the host can start the game" });
        }
        if (game.players.length < 2) {
          return res
            .status(400)
            .json({
              error: "At least 2 players are required to start the game",
            });
        }
        game.started = true;
        game.yahtzeeState = initializeYahtzeeState(game.players);
        return res.status(200).json(game);

      case "rollDice":
        if (game.yahtzeeState.currentPlayer !== username) {
          return res.status(403).json({ error: "Not your turn!" });
        }
        if (game.yahtzeeState.rollsLeft <= 0) {
          return res.status(400).json({ error: "No rolls left!" });
        }
        game.yahtzeeState.dice = game.yahtzeeState.dice.map(
          (die: number, index: number) =>
            game.yahtzeeState.heldDice[index]
              ? die
              : Math.ceil(Math.random() * 6)
        );
        game.yahtzeeState.rollsLeft -= 1;
        return res.status(200).json(game);

      case "holdDice":
        if (game.yahtzeeState.currentPlayer !== username) {
          return res.status(403).json({ error: "Not your turn!" });
        }
        diceIndexes.forEach((index: number) => {
          game.yahtzeeState.heldDice[index] =
            !game.yahtzeeState.heldDice[index];
        });
        return res.status(200).json(game);

      case "scoreCategory":
        if (game.yahtzeeState.currentPlayer !== username) {
          return res.status(403).json({ error: "Not your turn!" });
        }
        if (game.yahtzeeState.scores[username][category] !== undefined) {
          return res.status(400).json({ error: "Category already scored!" });
        }

        // Calculate the score
        const score = calculateScore(category, game.yahtzeeState.dice);
        game.yahtzeeState.scores[username][category] = score;

        // Update total score
        const totalScore = Object.values(
          game.yahtzeeState.scores[username]
        ).reduce((sum, categoryScore) => sum + (categoryScore || 0), 0);
        game.yahtzeeState.scores[username].total = totalScore;

        // Reset dice and advance turn
        game.yahtzeeState.rollsLeft = 3;
        game.yahtzeeState.dice = [1, 1, 1, 1, 1];
        game.yahtzeeState.heldDice = [false, false, false, false, false];
        const currentIndex = game.players.indexOf(
          game.yahtzeeState.currentPlayer
        );
        game.yahtzeeState.currentPlayer =
          game.players[(currentIndex + 1) % game.players.length];

        // Check if all players have completed all categories
        const allPlayersScored = game.players.every((player) => {
          const playerScores = game.yahtzeeState.scores[player];
          return ALL_CATEGORIES.every((category) => category in playerScores);
        });

        if (allPlayersScored) {
          game.yahtzeeState.gameOver = true;
        }

        return res.status(200).json(game);

      default:
        return res.status(400).json({ error: "Invalid action" });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST", "PUT"]);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}

function initializeYahtzeeState(players: string[]) {
  return {
    scores: players.reduce((acc, player) => {
      acc[player] = {};
      return acc;
    }, {}),
    dice: [1, 1, 1, 1, 1],
    heldDice: [false, false, false, false, false],
    rollsLeft: 3,
    currentPlayer: players[0],
    gameOver: false,
  };
}

function calculateScore(category: string, dice: number[]) {
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
    default:
      return 0;
  }
}
