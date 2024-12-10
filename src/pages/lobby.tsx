import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";

const Lobby = () => {
  const router = useRouter();
  const { id: gameId } = router.query; // Get the game ID from the URL

  const [game, setGame] = useState<any>(null);
  const [username, setUsername] = useState<string>("");

  // Fetch game details
  useEffect(() => {
    const fetchGame = async () => {
      if (!gameId) return;
      const response = await fetch(`/api/games/${gameId}`);
      const data = await response.json();
      setGame(data);
    };
    fetchGame();
  }, [gameId]);

  // Handle joining the lobby
  const handleJoinLobby = async () => {
    if (!username.trim()) {
      alert("Please enter your username.");
      return;
    }
    const response = await fetch(`/api/games`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gameId,
        username,
        action: "join",
      }),
    });
    if (!response.ok) {
      const error = await response.json();
      alert(error.error || "Failed to join the lobby.");
      return;
    }
    const updatedGame = await response.json();
    setGame(updatedGame);
  };

  // Start the game if you are the host
  const handleStartGame = async () => {
    const response = await fetch(`/api/games`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gameId,
        username,
        action: "start",
      }),
    });
    if (!response.ok) {
      const error = await response.json();
      alert(error.error || "Failed to start the game.");
      return;
    }
    router.push(`/game/${gameId}`);
  };

  if (!game) return <div>Loading...</div>;

  return (
    <div>
      <h1>{game.name}</h1>
      <h3>Host: {game.host}</h3>
      <h4>Players:</h4>
      <ul>
        {game.players.map((player: string) => (
          <li key={player}>{player}</li>
        ))}
      </ul>
      {!game.started && (
        <div>
          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <button onClick={handleJoinLobby}>Join Lobby</button>
        </div>
      )}
      {game.host === username && game.ready && !game.started && (
        <button onClick={handleStartGame}>Start Game</button>
      )}
      {!game.ready && <p>Waiting for more players...</p>}
    </div>
  );
};

export default Lobby;
