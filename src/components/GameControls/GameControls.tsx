import { FC } from "react";
import styles from '@/styles/GameControls.module.css';

interface GameControlsProps {
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
interface GameControlsProps {
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
  rollsLeft?: number;  // Make optional
  currentPlayer?: string;  // Make optional
}

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