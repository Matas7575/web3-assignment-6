import React, { createContext, useState, useContext, ReactNode } from "react";

// Define the shape of the game context
interface GameContextType {
  players: string[];
  setPlayers: React.Dispatch<React.SetStateAction<string[]>>;
  dice: number[];
  setDice: React.Dispatch<React.SetStateAction<number[]>>;
}

// Create a context with the defined type
const GameContext = createContext<GameContextType | null>(null);

/**
 * GameProvider component to provide game state to its children.
 * 
 * @param {Object} props - The properties for the GameProvider component.
 * @param {React.ReactNode} props.children - The child components that will have access to the game state.
 * @returns {JSX.Element} - The rendered GameProvider component.
 */
export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [players, setPlayers] = useState<string[]>([]);
  const [dice, setDice] = useState<number[]>([]);

  return (
    <GameContext.Provider value={{ players, setPlayers, dice, setDice }}>
      {children}
    </GameContext.Provider>
  );
};

/**
 * Custom hook to use the game context.
 * 
 * @returns {GameContextType} - The game context value.
 */
export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
};