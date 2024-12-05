import React, { createContext, useState, useContext } from "react";

const GameContext = createContext<any>(null);

export const GameProvider = ({ children }: { children: React.ReactNode }) => {
  const [players, setPlayers] = useState([]);
  const [dice, setDice] = useState([]);

  return (
    <GameContext.Provider value={{ players, setPlayers, dice, setDice }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => useContext(GameContext);
