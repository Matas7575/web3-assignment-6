import React, { useState, useEffect } from "react";
import Dice from "./Dice";
import ScoreTable from "./ScoreTable";
import PlayerList from "./PlayerList";

const GameBoard = ({ gameId }: { gameId: string }) => {
  const [gameState, setGameState] = useState<any>(null);

  // Fetch game data
  useEffect(() => {
    const fetchGameState = async () => {
      const response = await fetch(`/api/games/${gameId}`);
      const data = await response.json();
      setGameState(data);
    };
    fetchGameState();
  }, [gameId]);

  if (!gameState) return <div>Loading...</div>;

  return (
    <div>
      <h2>Game: {gameState.name}</h2>
      <PlayerList players={gameState.players} />
      <Dice dice={gameState.yahtzeeState?.dice} />
      <ScoreTable scores={gameState.yahtzeeState?.scores} />
    </div>
  );
};

export default GameBoard;
