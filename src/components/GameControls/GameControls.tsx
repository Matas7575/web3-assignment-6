import { FC } from "react";
import styles from '@/styles/GameControls.module.css';

/**
 * Props for the GameControls component.
 * 
 * @interface GameControlsProps
 * @property {() => void} onJoin - Function to handle joining a game
 * @property {() => void} onStart - Function to handle starting a game
 * @property {() => void} onRollDice - Function to handle rolling dice
 * @property {(category: string) => void} onScoreCategory - Function to handle scoring a category
 * @property {boolean} canJoin - Whether the join button should be enabled
 * @property {boolean} canStart - Whether the start button should be enabled
 * @property {boolean} canRoll - Whether the roll button should be enabled
 * @property {boolean} canScore - Whether scoring is currently allowed
 * @property {boolean} gameOver - Whether the game is over
 * @property {() => string} determineWinner - Function to determine the winner
 * @property {string[]} categories - Array of available scoring categories
 * @property {number} rollsLeft - Number of rolls remaining
 * @property {string} currentPlayer - Username of the current player
 */
export interface GameControlsProps {
  onJoin: () => void;
  onStart: () => void;
  onRollDice: () => void;
  onScoreCategory: (category: string) => void;
  canJoin: boolean;
  canStart: boolean;
  canRoll: boolean;
  canScore: boolean;
  gameOver: boolean;
  determineWinner: () => string;
  categories: string[];
  rollsLeft: number;
  currentPlayer: string;
}

/**
 * GameControls component to manage the game actions and controls.
 * 
 * @param {GameControlsProps} props - The properties for the GameControls component.
 * @returns {JSX.Element} - The rendered GameControls component.
 */
const GameControls: React.FC<GameControlsProps> = ({
  onJoin,
  onStart,
  onRollDice,
  onScoreCategory,
  canJoin,
  canStart,
  canRoll,
  canScore,
  gameOver,
  determineWinner,
  categories,
  rollsLeft = 0,  // Provide default value
  currentPlayer = ''  // Provide default value
}) => {
  const username = localStorage.getItem("username");
  const isCurrentPlayer = currentPlayer === username;

  // Debug logging for button conditions
  console.log('GameControls render conditions:', {
    canJoin,
    canStart,
    canRoll,
    canScore,
    gameOver,
    username,
    isCurrentPlayer
  });

  return (
    <div className={styles['controls-container']}>
      <div className={styles['game-status']}>
        {!gameOver ? (
          <>
            <p className={styles['current-player']}>
              Current Player: {currentPlayer}
              {isCurrentPlayer && ' (Your Turn)'}
            </p>
            {isCurrentPlayer && (
              <p className={styles['rolls-left']}>
                Rolls Left: {rollsLeft}
              </p>
            )}
          </>
        ) : (
          <div className={styles['game-over']}>
            <h2>Game Over!</h2>
            <p className={styles.winner}>
              Winner: {determineWinner()}
            </p>
          </div>
        )}
      </div>

      <div className={styles['action-buttons']}>
        {/* Always render buttons if conditions are met, regardless of gameOver state */}
        {canStart && (
          <button 
            onClick={onStart}
            className={styles.button}
            data-action="start"
          >
            Start Game
          </button>
        )}
        
        {canJoin && (
          <button 
            onClick={onJoin}
            className={styles.button}
            data-action="join"
          >
            Join Game
          </button>
        )}
        
        {canRoll && (
          <button 
            onClick={onRollDice}
            className={styles.button}
            data-action="roll"
          >
            Roll Dice ({rollsLeft} left)
          </button>
        )}
      </div>

      {!gameOver && canScore && (
        <div className={styles['scoring-section']}>
          <h3 className={styles['section-title']}>Score Your Dice</h3>
          <div className={styles['category-grid']}>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => onScoreCategory(category)}
                className={styles['category-button']}
              >
                Score {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GameControls;