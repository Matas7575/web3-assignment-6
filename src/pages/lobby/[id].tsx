// src/pages/lobby/[id].tsx

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import ScoreTable from "@/components/ScoreTable";
import { io } from "socket.io-client";

const ALL_CATEGORIES = ["ones", "twos", "threes", "fours", "fives", "sixes"];

let socket: any;

const LobbyPage = () => {
  const router = useRouter();
  const { id: lobbyId } = router.query;

  const [lobby, setLobby] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!lobbyId || typeof lobbyId !== "string") return;

    // Fetch initial lobby data
    const fetchLobby = async () => {
      try {
        const response = await fetch(`/api/games?gameId=${lobbyId}`);
        if (!response.ok) {
          throw new Error(`Error fetching lobby: ${response.statusText}`);
        }
        const data = await response.json();
        console.log("Initial lobby data fetched:", data);
        setLobby(data);
      } catch (error) {
        console.error("Failed to fetch lobby:", error);
        alert("Failed to load lobby. Redirecting to home.");
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    fetchLobby();

    // Connect to the Socket.IO server
    socket = io("http://localhost:3000");

    // Join the room for this game
    socket.emit("joinGameRoom", lobbyId);

    socket.on("gameUpdate", (data: any) => {
      console.log("Received game update:", data);
      if (data.type === "update" && data.game.id === lobbyId) {
        setLobby(data.game);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [lobbyId, router]);

  const handleAction = async (action: string, payload: any = {}) => {
    try {
      const username = localStorage.getItem("username");
      if (!username) {
        alert("Username not found. Please set your username.");
        return;
      }

      const response = await fetch(`/api/games`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId: lobbyId, username, action, ...payload }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Unknown error");
      }

      const data = await response.json();
      console.log(`Action '${action}' performed successfully:`, data);
      setLobby(data); // Optional: Immediate update
    } catch (error: any) {
      console.error(`Error performing action '${action}':`, error);
      alert(error.message || "An error occurred.");
    }
  };

  const handleJoin = () => handleAction("join");
  const handleStartGame = () => handleAction("start");
  const handleRollDice = () => handleAction("rollDice");
  const handleHoldDice = (index: number) =>
    handleAction("holdDice", { diceIndexes: [index] });
  const handleScoreCategory = (category: string) =>
    handleAction("scoreCategory", { category });

  if (loading) return <p>Loading...</p>;
  if (!lobby) return <p>Lobby not found</p>;

  const determineWinner = () => {
    // Ensure all players have filled all categories
    const allScored = lobby.players.every((player: string) => {
      const scores = lobby.yahtzeeState.scores[player];
      return ALL_CATEGORIES.every((category) => scores[category] !== undefined);
    });

    if (!allScored) {
      return "Game is not yet complete.";
    }

    const winner = Object.entries(lobby.yahtzeeState.scores).reduce(
      (winnerAcc, [player, score]) => {
        const typedScore = score as { total: number };
        return typedScore.total > (winnerAcc.score?.total || 0)
          ? { player, score: typedScore }
          : winnerAcc;
      },
      { player: "No Winner", score: { total: 0 } }
    );
    return winner.player;
  };

  return (
    <div>
      <h1>Lobby: {lobby.name}</h1>
      <p>Host: {lobby.host}</p>
      <p>Players:</p>
      <ul>
        {lobby.players.map((player: string) => (
          <li key={player}>{player}</li>
        ))}
      </ul>
      {lobby.started ? (
        <div>
          <h2>Game Started</h2>
          <p>Current Player: {lobby.yahtzeeState?.currentPlayer || "N/A"}</p>
          <p>Rolls Left: {lobby.yahtzeeState?.rollsLeft ?? "N/A"}</p>
          <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
            {lobby.yahtzeeState?.dice?.map((die: number, index: number) => (
              <button
                key={index}
                onClick={() => handleHoldDice(index)}
                style={{
                  position: "relative",
                  padding: "0",
                  border: lobby.yahtzeeState?.heldDice[index]
                    ? "2px solid green"
                    : "1px solid gray",
                  borderRadius: "8px",
                  background: "none",
                  cursor: "pointer",
                }}
              >
                <Image
                  src={`/assets/${die}.png`}
                  alt={`Die ${die}`}
                  width={60}
                  height={60}
                />
                {lobby.yahtzeeState?.heldDice[index] && (
                  <span
                    style={{
                      position: "absolute",
                      top: "5px",
                      right: "5px",
                      backgroundColor: "rgba(0, 255, 0, 0.7)",
                      color: "white",
                      padding: "2px 5px",
                      borderRadius: "4px",
                      fontSize: "12px",
                    }}
                  >
                    Held
                  </span>
                )}
              </button>
            )) || <p>No dice available</p>}
          </div>
          <button onClick={handleRollDice}>Roll Dice</button>

          <ScoreTable scores={lobby.yahtzeeState?.scores} />

          {lobby.yahtzeeState.gameOver ? (
            <h3>Game Over! Winner: {determineWinner()}</h3>
          ) : (
            <div>
              <h3>Score Your Dice</h3>
              <ul>
                {ALL_CATEGORIES.map((category) => (
                  <li key={category}>
                    <button onClick={() => handleScoreCategory(category)}>
                      Score {category}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <button onClick={handleStartGame}>Start Game</button>
      )}
      {!lobby.started &&
        !lobby.players.includes(localStorage.getItem("username") || "") && (
          <button onClick={handleJoin}>Join Game</button>
        )}
    </div>
  );
};

export default LobbyPage;
