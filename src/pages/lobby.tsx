"use client";

import React, { useState, useEffect } from "react";

type Game = {
  id: string;
  name: string;
  host: string;
  players: string[];
  ready: boolean;
  started: boolean;
  yahtzeeState?: YahtzeeState;
};

type YahtzeeState = {
  currentPlayer: string;
  dice: number[];
  rollsLeft: number;
};

const Lobby = () => {
  const [games, setGames] = useState<Game[]>([]); // Define the type for games
  const [username, setUsername] = useState<string>("");
  const [playerName, setPlayerName] = useState<string>("");
  const [currentGameId, setCurrentGameId] = useState<string | null>(null);
  const [gameReady, setGameReady] = useState<boolean>(false);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [yahtzeeState, setYahtzeeState] = useState<YahtzeeState | null>(null);

  // Fetch games periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const fetchGames = async () => {
        try {
          const response = await fetch("/api/games");
          const gamesData: Game[] = await response.json(); // Ensure response matches Game[]
          setGames(gamesData);
        } catch (error) {
          console.error("Failed to fetch games:", error);
        }
      };

      fetchGames();
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  useEffect(() => {
    if (currentGameId) {
      const currentGame = games.find((game) => game.id === currentGameId);
      if (currentGame) {
        setGameReady(currentGame.ready);
        setGameStarted(currentGame.started);
        setYahtzeeState(currentGame.yahtzeeState || null);
      }
    }
  }, [games, currentGameId]);

  const createGame = async () => {
    const response = await fetch("/api/games", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });

    if (response.ok) {
      const newGame: Game = await response.json(); // Ensure response matches Game
      setGames((prevGames) => [...prevGames, newGame]);
      setCurrentGameId(newGame.id);
    } else {
      const error = await response.json();
      alert(error.error);
    }
  };

  const joinGame = async (gameId: string) => {
    const response = await fetch("/api/games", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameId, username: playerName, action: "join" }),
    });

    if (response.ok) {
      const updatedGame: Game = await response.json(); // Ensure response matches Game
      setGames((prevGames) =>
        prevGames.map((game) => (game.id === gameId ? updatedGame : game))
      );
      setCurrentGameId(gameId);
    } else {
      const error = await response.json();
      alert(error.error);
    }
  };

  const startGame = async () => {
    const response = await fetch("/api/games", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gameId: currentGameId,
        username,
        action: "start",
      }),
    });

    if (response.ok) {
      const updatedGame: Game = await response.json(); // Ensure response matches Game
      setGames((prevGames) =>
        prevGames.map((game) =>
          game.id === currentGameId ? updatedGame : game
        )
      );
      setGameStarted(true);
    } else {
      const error = await response.json();
      alert(error.error);
    }
  };

  if (gameStarted && yahtzeeState) {
    return <YahtzeeGame yahtzeeState={yahtzeeState} />;
  }

  return (
    <div>
      <h1>Lobby</h1>
      {!currentGameId && (
        <div>
          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <button onClick={createGame} disabled={!username.trim()}>
            Create Game
          </button>
        </div>
      )}

      {currentGameId && (
        <div>
          <h2>
            You are in a game:{" "}
            {games.find((game) => game.id === currentGameId)?.name}
          </h2>
          {gameReady && (
            <>
              {games.find((g) => g.id === currentGameId)?.host === username && (
                <button onClick={startGame} disabled={gameStarted}>
                  Start Game
                </button>
              )}
              <p>
                Players in lobby:{" "}
                {games.find((g) => g.id === currentGameId)?.players.join(", ")}
              </p>
            </>
          )}
        </div>
      )}

      <h2>Available Games</h2>
      <ul>
        {games
          .filter((game) => game.id !== currentGameId)
          .map((game) => (
            <li key={game.id}>
              {game.name} - Players: {game.players.join(", ")}
              {!currentGameId && (
                <div>
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                  />
                  <button
                    onClick={() => joinGame(game.id)}
                    disabled={!playerName.trim()}
                  >
                    Join Game
                  </button>
                </div>
              )}
            </li>
          ))}
      </ul>
    </div>
  );
};

const YahtzeeGame = ({ yahtzeeState }: { yahtzeeState: YahtzeeState }) => {
  return (
    <div>
      <h1>Yahtzee Game</h1>
      <p>Current Player: {yahtzeeState.currentPlayer}</p>
      <p>Dice: {yahtzeeState.dice.join(", ")}</p>
      <p>Rolls Left: {yahtzeeState.rollsLeft}</p>
      {/* Implement additional game logic and UI */}
    </div>
  );
};

export default Lobby;
