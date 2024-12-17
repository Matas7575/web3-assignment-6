import { FC } from "react";

interface GameControlsProps {
  onJoin: () => void;
  onStart: () => void;
  onRollDice: () => void;
  onHoldDice: (index: number) => void;
  onScoreCategory: (category: string) => void;
  canJoin: boolean;
  canStart: boolean;
  canRoll: boolean;
  canScore: boolean;
  gameOver: boolean;
  determineWinner: () => string;
  categories: string[];
}

const GameControls: FC<GameControlsProps> = ({
  onJoin,
  onStart,
  onRollDice,
  onHoldDice,
  onScoreCategory,
  canJoin,
  canStart,
  canRoll,
  canScore,
  gameOver,
  determineWinner,
  categories,
}) => {
  return (
    <div>
      {!gameOver && canStart && <button onClick={onStart}>Start Game</button>}
      {!gameOver && canJoin && <button onClick={onJoin}>Join Game</button>}

      {canRoll && <button onClick={onRollDice}>Roll Dice</button>}

      {!gameOver && canScore && (
        <div>
          <h3>Score Your Dice</h3>
          <ul>
            {categories.map((category) => (
              <li key={category}>
                <button onClick={() => onScoreCategory(category)}>
                  Score {category}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {gameOver && <h3>Game Over! Winner: {determineWinner()}</h3>}
    </div>
  );
};

export default GameControls;
