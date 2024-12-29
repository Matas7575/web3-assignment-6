import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import Dice from "@/components/Dice/Dice";
import PlayersList from "@/components/Players/PlayersList";
import ScoreTable from "@/components/ScoreTable";
import GameControls from "@/components/GameControls/GameControls";
import useGameSocket from "@/hooks/useGameSocket";
import { fetchGame, performAction } from "@/services/gameService";

const ALL_CATEGORIES = ["ones", "twos", "threes", "fours", "fives", "sixes"];

/**
 * LobbyPage component to manage the game lobby and game state.
 */
const LobbyPage = () => {
  const router = useRouter();
  const { id: lobbyId } = router.query;

  const [lobby, setLobby] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch initial lobby data
  useEffect(() => {
    if (!lobbyId || typeof lobbyId !== "string") return;

    const fetchLobby = async () => {
      try {
        const data = await fetchGame(lobbyId);
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
  }, [lobbyId, router]);

  // Handle game updates via Socket.io
  const handleGameUpdate = useCallback((updatedGame: any) => {
    console.log("Game update received:", updatedGame);
    setLobby(updatedGame);
  }, []);

  // Initialize socket
  useGameSocket(lobbyId as string, handleGameUpdate);

  /**
   * Handles performing an action in the game.
   * 
   * @param {string} action - The action to perform.
   * @param {any} payload - The payload for the action.
   */
  const handleAction = async (action: string, payload: any = {}) => {
    try {
      const username = localStorage.getItem("username");
      if (!username) {
        alert("Username not found. Please set your username.");
        return;
      }

      const data = await performAction(
        lobbyId as string,
        username,
        action,
        payload
      );
      console.log(`Action '${action}' performed successfully:`, data);
      setLobby(data);
    } catch (error: any) {
      console.error(`Error performing action '${action}':`, error);
      alert(error.message || "An error occurred.");
    }
  };

  // Action handlers
  const handleJoin = () => handleAction("join");
  const handleStartGame = () => handleAction("start");
  const handleRollDice = () => handleAction("rollDice");
  const handleHoldDice = (index: number) =>
    handleAction("holdDice", { diceIndexes: [index] });
  const handleScoreCategory = (category: string) =>
    handleAction("scoreCategory", { category });

  if (loading) return <p>Loading...</p>;
  if (!lobby) return <p>Lobby not found</p>;

  /**
   * Determines the winner of the game.
   * 
   * @returns {string} - The username of the winner or a message if the game is not complete.
   */
  const determineWinner = () => {
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
      <PlayersList players={lobby.players} />

      {lobby.started ? (
        <div>
          <h2>Game Started</h2>
          <p>Current Player: {lobby.yahtzeeState?.currentPlayer || "N/A"}</p>
          <p>Rolls Left: {lobby.yahtzeeState?.rollsLeft ?? "N/A"}</p>

          <Dice
            dice={lobby.yahtzeeState?.dice || []}
            heldDice={lobby.yahtzeeState?.heldDice || []}
            onHold={handleHoldDice}
          />

          <ScoreTable scores={lobby.yahtzeeState?.scores} />

          <GameControls
            onJoin={handleJoin}
            onStart={handleStartGame}
            onRollDice={handleRollDice}
            onHoldDice={handleHoldDice}
            onScoreCategory={handleScoreCategory}
            canJoin={
              !lobby.started &&
              !lobby.players.includes(localStorage.getItem("username") || "")
            }
            canStart={
              lobby.host === localStorage.getItem("username") && !lobby.started
            }
            canRoll={
              lobby.started &&
              lobby.yahtzeeState.currentPlayer ===
                localStorage.getItem("username") &&
              lobby.yahtzeeState.rollsLeft > 0 &&
              !lobby.yahtzeeState.gameOver
            }
            canScore={!lobby.yahtzeeState.gameOver}
            gameOver={lobby.yahtzeeState.gameOver}
            determineWinner={determineWinner}
            categories={ALL_CATEGORIES}
          />
        </div>
      ) : (
        <GameControls
          onJoin={handleJoin}
          onStart={handleStartGame}
          onRollDice={() => {}}
          onHoldDice={() => {}}
          onScoreCategory={() => {}}
          canJoin={
            !lobby.started &&
            !lobby.players.includes(localStorage.getItem("username") || "")
          }
          canStart={
            lobby.host === localStorage.getItem("username") && !lobby.started
          }
          canRoll={false}
          canScore={false}
          gameOver={false}
          determineWinner={() => ""}
          categories={ALL_CATEGORIES}
        />
      )}
    </div>
  );
};

export default LobbyPage;