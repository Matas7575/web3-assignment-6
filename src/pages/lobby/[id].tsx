import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import Dice from "@/components/Dice/Dice";
import PlayersList from "@/components/Players/PlayersList";
import ScoreTable from "@/components/ScoreTable";
import GameControls from "@/components/GameControls/GameControls";
import useGameSocket from "@/hooks/useGameSocket";
import { fetchGame, performAction } from "@/services/gameService";
import { Game } from "@/pages/api/games/types";
import styles from '@/styles/GameBoard.module.css';

const ALL_CATEGORIES = ["ones", "twos", "threes", "fours", "fives", "sixes"];

/**
 * Interface for error responses from the server.
 * 
 * @interface GameError
 * @property {string} message - The error message.
 * @property {string} [error] - Optional error details.
 * @category Types
 */
interface GameError {
  message: string;
  error?: string;
}

/**
 * Interface for game update data received from the server.
 * 
 * @interface GameUpdateData
 * @property {string} type - The type of update event.
 * @property {Game} game - The updated game data.
 */
interface GameUpdateData {
  type: string;
  game: Game;
}

/**
 * The main game lobby page component.
 * Handles game state, player interactions, and real-time updates.
 * 
 * Features:
 * - Manages game lobby state and player connections
 * - Handles game actions (rolling dice, scoring, etc.)
 * - Updates game state in real-time using WebSocket
 * - Manages player turns and game flow
 * 
 * @module Pages
 * @category Game
 * @example
 * // Page is accessed via URL: /lobby/[gameId]
 * // Internal route configuration
 * {
 *   path: '/lobby/[id]',
 *   component: LobbyPage
 * }
 * 
 * @remarks
 * - Requires authentication (username in localStorage)
 * - Connects to WebSocket for real-time updates
 * - Handles all game logic and state management
 */
const LobbyPage = () => {
  const router = useRouter();
  const { id: lobbyId } = router.query;
  const username = localStorage.getItem("username");

  const [lobby, setLobby] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debug logging for lobby state
  useEffect(() => {
    console.log('Current lobby state:', lobby);
  }, [lobby]);

  // Fetch initial lobby data
  useEffect(() => {
    if (!lobbyId || typeof lobbyId !== "string") return;

    const fetchLobby = async () => {
      try {
        const response = await fetch(`/api/games?gameId=${lobbyId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch lobby data');
        }
        const data = await response.json();
        console.log('Fetched lobby data:', data);
        setLobby(data);
      } catch (error) {
        console.error("Failed to fetch lobby:", error);
        setError("Failed to load lobby data");
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    fetchLobby();
  }, [lobbyId, router]);

  /**
   * Handles game state updates received through WebSocket
   * 
   * @param {Game} updatedGame - The updated game state
   */
  const handleGameUpdate = useCallback((updatedGame: Game) => {
    console.log("Game update received:", updatedGame);
    setLobby(updatedGame);
  }, []);

  // Initialize socket
  useGameSocket(lobbyId as string, handleGameUpdate);

  /**
   * Handles performing an action in the game.
   * 
   * @param {string} action - The action to perform.
   * @param {Record<string, unknown>} payload - The payload for the action.
   */
  const handleAction = async (action: string, payload: Record<string, unknown> = {}) => {
    if (!username) {
      setError("Username not found. Please set your username.");
      return;
    }
  
    try {
      const data = await performAction(
        lobbyId as string,
        username,
        action,
        payload
      );
      console.log(`Action '${action}' performed successfully:`, data);
      setLobby(data);
    } catch (error: unknown) {
      const gameError = error as GameError;
      console.error(`Error performing action '${action}':`, error);
      setError(gameError.message || "An error occurred.");
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

  /**
   * Determines the winner of the game.
   * 
   * @returns {string} - The username of the winner or a message if the game is not complete.
   */
  const determineWinner = () => {
    if (!lobby?.yahtzeeState?.scores) return "Game not finished";

    const allScored = lobby.players.every((player: string) => {
      const scores = lobby.yahtzeeState?.scores[player];
      return scores ? ALL_CATEGORIES.every((category) => scores[category] !== undefined) : false;
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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!lobby) return <div>Lobby not found</div>;

  // Debug logging for start game conditions
  console.log('Start game conditions:', {
    username,
    host: lobby.host,
    started: lobby.started,
    players: lobby.players
  });

  const canJoin = !lobby.started && lobby.players && !lobby.players.includes(username || "");
  const canStart = lobby.host === username && !lobby.started && lobby.players.length >= 2;
  console.log('Detailed start conditions:', {
    'isHost': lobby.host === username,
    'notStarted': !lobby.started,
    'enoughPlayers': lobby.players.length >= 2,
    'finalCanStart': canStart,
    'host': lobby.host,
    'username': username,
    'playerCount': lobby.players.length,
    'players': lobby.players
  });
  const canRoll = lobby.started &&
                 lobby.yahtzeeState?.currentPlayer === username &&
                 (lobby.yahtzeeState?.rollsLeft || 0) > 0 &&
                 !lobby.yahtzeeState?.gameOver;

  return (
    <div className={styles["game-board"]}>
      <h1>Lobby: {lobby.name}</h1>
      <p>Host: {lobby.host}</p>

      <div className={styles["players-list"]}>
        <PlayersList 
          players={lobby.players || []}
          currentPlayer={lobby.yahtzeeState?.currentPlayer || ''}
          host={lobby.host}
        />
      </div>

      {lobby.started ? (
        <div className={styles["game-layout"]}>
          <div className={styles["game-main"]}>
            <div className={`${styles["game-section"]} ${styles["dice-section"]}`}>
              <Dice
                dice={lobby.yahtzeeState?.dice || []}
                heldDice={lobby.yahtzeeState?.heldDice || []}
                onHold={handleHoldDice}
                canHold={lobby.yahtzeeState?.currentPlayer === username}
              />
            </div>

            <div className={styles["game-section"]}>
              <ScoreTable 
                scores={lobby.yahtzeeState?.scores || {}} 
                currentPlayer={lobby.yahtzeeState?.currentPlayer || ''} 
              />
            </div>
          </div>

          <div className={styles["controls-section"]}>
            <GameControls
              onJoin={handleJoin}
              onStart={handleStartGame}
              onRollDice={handleRollDice}
              onScoreCategory={handleScoreCategory}
              canJoin={canJoin}
              canStart={canStart}
              canRoll={canRoll}
              canScore={!lobby.yahtzeeState?.gameOver}
              gameOver={lobby.yahtzeeState?.gameOver || false}
              determineWinner={determineWinner}
              categories={ALL_CATEGORIES}
              rollsLeft={lobby.yahtzeeState?.rollsLeft || 0}
              currentPlayer={lobby.yahtzeeState?.currentPlayer || ''}
            />
          </div>
        </div>
      ) : (
        <div className={styles["game-controls"]}>
          <GameControls
            onJoin={handleJoin}
            onStart={handleStartGame}
            onRollDice={() => {}}
            onScoreCategory={() => {}}
            canJoin={canJoin}
            canStart={canStart}
            canRoll={false}
            canScore={false}
            gameOver={false}
            determineWinner={() => ""}
            categories={ALL_CATEGORIES}
            rollsLeft={0}
            currentPlayer={''}
          />
        </div>
      )}
    </div>
  );
};

export default LobbyPage;