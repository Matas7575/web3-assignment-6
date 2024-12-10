import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import ScoreTable from "@/components/ScoreTable";

const LobbyPage = () => {
  const router = useRouter();
  const { id: lobbyId } = router.query;

  const [lobby, setLobby] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!lobbyId) return;

    const fetchLobby = async () => {
      const response = await fetch(`/api/games?gameId=${lobbyId}`);
      const data = await response.json();
      setLobby(data);
      setLoading(false);
    };

    fetchLobby();
  }, [lobbyId]);

  const handleJoin = async () => {
    try {
      const username = localStorage.getItem("username");
      const response = await fetch(`/api/games`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId: lobbyId, username, action: "join" }),
      });
      const data = await response.json();
      setLobby(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleStartGame = async () => {
    try {
      const username = localStorage.getItem("username");
      const response = await fetch(`/api/games`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId: lobbyId, username, action: "start" }),
      });
      const data = await response.json();
      setLobby(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleRollDice = async () => {
    const username = localStorage.getItem("username");
    const response = await fetch(`/api/games`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameId: lobbyId, username, action: "rollDice" }),
    });
    const data = await response.json();
    setLobby(data);
  };

  const handleHoldDice = async (index: number) => {
    const username = localStorage.getItem("username");
    const response = await fetch(`/api/games`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gameId: lobbyId,
        username,
        action: "holdDice",
        diceIndexes: [index],
      }),
    });
    const data = await response.json();
    setLobby(data);
  };

  const handleScoreCategory = async (category: string) => {
    const username = localStorage.getItem("username");
    const response = await fetch(`/api/games`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gameId: lobbyId,
        username,
        action: "scoreCategory",
        category,
      }),
    });
    const data = await response.json();
    setLobby(data);
  };

  if (loading) return <p>Loading...</p>;
  if (!lobby) return <p>Lobby not found</p>;

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
          <p>Current Player: {lobby.yahtzeeState?.currentPlayer}</p>
          <p>Rolls Left: {lobby.yahtzeeState?.rollsLeft}</p>
          <div>
            {lobby.yahtzeeState?.dice?.map((die, index) => (
              <button key={index} onClick={() => handleHoldDice(index)}>
                {die} {lobby.yahtzeeState?.heldDice[index] ? "(Held)" : ""}
              </button>
            )) || <p>No dice available</p>}
          </div>
          <button onClick={handleRollDice}>Roll Dice</button>

          <ScoreTable scores={lobby.yahtzeeState?.scores} />

          {lobby.yahtzeeState.gameOver ? (
            <h3>
              Game Over! Winner:{" "}
              {
                Object.entries(lobby.yahtzeeState.scores).reduce(
                  (winner, [player, score]) =>
                    score.total > (winner.score?.total || 0)
                      ? { player, score }
                      : winner,
                  {}
                ).player
              }
            </h3>
          ) : (
            <div>
              <h3>Score Your Dice</h3>
              <ul>
                {["ones", "twos", "threes", "fours", "fives", "sixes"].map(
                  (category) => (
                    <li key={category}>
                      <button onClick={() => handleScoreCategory(category)}>
                        Score {category}
                      </button>
                    </li>
                  )
                )}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <button onClick={handleStartGame}>Start Game</button>
      )}
    </div>
  );
};

export default LobbyPage;
