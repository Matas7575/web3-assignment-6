import React, { createContext, useState, useContext, ReactNode } from "react";

/**
 * Defines the shape of the game context state.
 *
 * @interface GameContextType
 * @property {string[]} players - Array of players in the game
 * @property {React.Dispatch<React.SetStateAction<string[]>>} setPlayers - Function to update players
 * @property {number[]} dice - Current values of the dice
 * @property {React.Dispatch<React.SetStateAction<number[]>>} setDice - Function to update dice values
 */
export interface GameContextType {
  players: string[];
  setPlayers: React.Dispatch<React.SetStateAction<string[]>>;
  dice: number[];
  setDice: React.Dispatch<React.SetStateAction<number[]>>;
}

// Create a context with the defined type
const GameContext = createContext<GameContextType | null>(null);

/**
 * Props for the GameProvider component.
 *
 * @interface GameProviderProps
 * @property {ReactNode} children - Child components that will have access to the game state
 */
export interface GameProviderProps {
  children: ReactNode;
}

/**
 * Provider component for game state management.
 * Provides game state to its children using React Context.
 *
 * @param {GameProviderProps} props - Component props
 * @returns {JSX.Element} Rendered provider component
 */
export const GameProvider = ({ children }: GameProviderProps) => {
  const [players, setPlayers] = useState<string[]>([]); // Dynamic state
  const [dice, setDice] = useState<number[]>([]); // Dice values

  return (
    <GameContext.Provider value={{ players, setPlayers, dice, setDice }}>
      {children}
    </GameContext.Provider>
  );
};

/**
 * Custom hook to access the game context.
 * Must be used within a GameProvider component.
 *
 * @returns {GameContextType} The game context value
 * @throws {Error} If used outside of a GameProvider
 */
export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
};
