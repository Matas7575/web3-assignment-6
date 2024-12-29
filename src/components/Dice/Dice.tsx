import Image from "next/image";
import styles from '@/styles/Dice.module.css';
import { DiceState, YahtzeeState } from '@/pages/api/games/types';

/**
 * Props for the Dice component.
 * 
 * @interface DiceProps
 * @property {number[]} dice - Array of current dice values (1-6)
 * @property {boolean[]} heldDice - Array indicating which dice are held
 * @property {(index: number) => void} onHold - Function to handle dice hold toggling
 * @property {boolean} canHold - Whether dice can currently be held
 */
interface DiceProps {
  dice: number[];
  heldDice: boolean[];
  onHold: (index: number) => void;
  canHold: boolean;
}

/**
 * Component that displays and manages the dice in the game.
 * Shows the current dice values and allows players to hold/unhold dice during their turn.
 * 
 * @module Components
 * @category Game
 * @example
 *   dice={[1, 3, 3, 4, 6]}
 *   heldDice={[false, true, true, false, false]}
 *   onHold={(index) => handleHoldDie(index)}
 *   canHold={true}
 * />
 * 
 * @example
 * // Disabled state (can't hold dice)
 * <Dice
 *   dice={[1, 3, 3, 4, 6]}
 *   heldDice={[false, false, false, false, false]}
 *   onHold={(index) => handleHoldDie(index)}
 *   canHold={false}  // Dice can't be held (not player's turn or before first roll)
 * />
 */
const Dice: React.FC<DiceProps> = ({ dice, heldDice, onHold, canHold }) => {
  return (
    <div className={styles["dice-container"]}>
      {dice.map((die, index) => (
        <button
          key={index}
          onClick={() => onHold(index)}
          className={`${styles["dice-button"]} ${heldDice[index] ? styles.held : ""}`}
          disabled={!canHold || die === 0}
          aria-label={`Die showing ${die}${heldDice[index] ? ' (Held)' : ''}`}
        >
          <Image
            src={`/assets/${die}.png`}
            alt={`Die ${die}`}
            width={60}
            height={60}
          />
          {heldDice[index] && (
            <span className={styles["held-indicator"]}>
              Held
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

export default Dice;

/**
 * Custom hook to manage dice state and actions.
 * Provides methods for rolling dice and managing held state.
 * 
 * @param {YahtzeeState} gameState - Current state of the game
 * @returns {Object} Object containing dice state and methods
 * 
 * @example
 * const {
 *   canRollDice,
 *   canHoldDice,
 *   rollDice,
 *   toggleHoldDie
 * } = useDiceManager(gameState);
 */
export const useDiceManager = (gameState: YahtzeeState) => {
  const username = localStorage.getItem("username");
  
  // Check if it's the current player's turn
  const isCurrentPlayer = (): boolean => {
    return gameState.currentPlayer === username;
  };

  // Check if dice can be rolled
  const canRollDice = (): boolean => {
    return (
      isCurrentPlayer() &&
      gameState.rollsLeft > 0 &&
      !gameState.gameOver
    );
  };

  // Check if dice can be held
  const canHoldDice = (): boolean => {
    return (
      isCurrentPlayer() &&
      gameState.turnStarted &&
      gameState.rollsLeft < 3 &&
      !gameState.gameOver
    );
  };

  // Roll the dice
  const rollDice = async () => {
    if (!canRollDice()) return;

    try {
      // Your dice rolling logic here
      console.log('Rolling dice...');
    } catch (error) {
      console.error('Error rolling dice:', error);
    }
  };

  // Toggle hold state of a die
  const toggleHoldDie = async (index: number) => {
    if (!canHoldDice()) return;

    try {
      // Your hold die logic here
      console.log('Toggling hold state of die:', index);
    } catch (error) {
      console.error('Error toggling die hold state:', error);
    }
  };

  return {
    canRollDice,
    canHoldDice,
    rollDice,
    toggleHoldDie
  };
};