import React, { useState, useEffect } from "react";
import Dice from "./Dice";
import ScoreTable from "./ScoreTable";
import PlayerList from "./PlayerList";

// Define types for players and dice
type Player = {
  id: string;
  name: string;
  score: number;
};

type Die = {
  id: number;
  value: number;
};

const GameBoard = () => {
  // Define state with proper types
  const [players, setPlayers] = useState<Player[]>([]);
  const [dice, setDice] = useState<Die[]>([]);

  // Fetch initial data
  useEffect(() => {
    const fetchGameData = async () => {
      try {
        const playerResponse = await fetch("/api/players");
        const diceResponse = await fetch("/api/dice");
        const players = await playerResponse.json();
        const dice = await diceResponse.json();

        setPlayers(players);
        setDice(dice);
      } catch (error) {
        console.error("Error fetching game data:", error);
      }
    };

    fetchGameData();
  }, []);

  // Handle rolling dice
  const rollDice = async (dieId: number) => {
    try {
      const response = await fetch("/api/dice/roll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dieId }),
      });
      const updatedDie: Die = await response.json();
      setDice((prevDice) =>
        prevDice.map((die) => (die.id === dieId ? updatedDie : die))
      );
    } catch (error) {
      console.error("Error rolling dice:", error);
    }
  };

  return (
    <div>
      <h2>Game Board</h2>
      <PlayerList players={players} />
      {dice.map((die) => (
        <Dice key={die.id} value={die.value} onRoll={() => rollDice(die.id)} />
      ))}
      <ScoreTable players={players} />
    </div>
  );
};

export default GameBoard;
