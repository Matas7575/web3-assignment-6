import React from "react";
import styles from '@/styles/ScoreTable.module.css';

/**
 * Props for the ScoreTable component
 * 
 * @interface ScoreTableProps
 * @property {Record<string, Record<string, number | undefined>>} scores - Scores for each player
 * @property {string} currentPlayer - Username of the player whose turn it is
 * @property {(category: string) => void} [onSelectCategory] - Optional callback when a category is selected
 * @property {string[]} [availableCategories] - Optional array of categories that can be selected
 */
interface ScoreTableProps {
  scores: Record<string, Record<string, number | undefined>>;
  currentPlayer: string;
  onSelectCategory?: (category: string) => void;
  availableCategories?: string[];
}

/**
 * Displays the game's score table with all players' scores and available categories.
 * Highlights the current player and shows which categories can be selected.
 * Calculates and displays various score totals and bonuses.
 * 
 * @component
 * @example
 * // Basic usage
 * <ScoreTable
 *   scores={{
 *     "player1": { ones: 3, twos: 6, total: 9 },
 *     "player2": { ones: 2, twos: 8, total: 10 }
 *   }}
 *   currentPlayer="player1"
 * />
 * 
 * @example
 * // With category selection
 * <ScoreTable
 *   scores={gameScores}
 *   currentPlayer="player1"
 *   onSelectCategory={(category) => handleCategorySelect(category)}
 *   availableCategories={["ones", "twos"]}
 * />
 */
const ScoreTable: React.FC<ScoreTableProps> = ({ 
  scores, 
  currentPlayer,
  onSelectCategory,
  availableCategories = []
}) => {
  const username = localStorage.getItem("username");
  const isCurrentPlayer = username === currentPlayer;

  const calculateUpperBonus = (playerScores: Record<string, number | undefined>) => {
    const upperScores = ['ones', 'twos', 'threes', 'fours', 'fives', 'sixes'];
    const total = upperScores.reduce((sum, category) => 
      sum + (playerScores[category] || 0), 0);
    return total >= 63 ? 35 : 0;
  };

  const formatScore = (score: number | undefined) => {
    if (score === undefined) return '-';
    return score.toString();
  };

  const isCategoryAvailable = (category: string) => {
    return availableCategories.includes(category);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Scoreboard</h2>
      <div className={styles['table-container']}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.header}>Category</th>
              {Object.keys(scores).map(player => (
                <th 
                  key={player} 
                  className={`${styles.header} ${
                    player === currentPlayer ? styles['current-player'] : ''
                  }`}
                >
                  {player}
                  {player === username && ' (You)'}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Upper Section */}
            {['ones', 'twos', 'threes', 'fours', 'fives', 'sixes'].map(category => (
              <tr key={category}>
                <td 
                  className={`${styles.category} ${
                    isCurrentPlayer && isCategoryAvailable(category) 
                      ? styles.available 
                      : ''
                  }`}
                  onClick={() => {
                    if (isCurrentPlayer && isCategoryAvailable(category) && onSelectCategory) {
                      onSelectCategory(category);
                    }
                  }}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </td>
                {Object.entries(scores).map(([player, playerScores]) => (
                  <td 
                    key={player}
                    className={`${styles.score} ${
                      player === currentPlayer ? styles['current-player'] : ''
                    }`}
                  >
                    {formatScore(playerScores[category])}
                  </td>
                ))}
              </tr>
            ))}
            
            {/* Upper Bonus */}
            <tr className={styles['bonus-row']}>
              <td className={styles.category}>Upper Bonus</td>
              {Object.entries(scores).map(([player, playerScores]) => (
                <td 
                  key={player}
                  className={`${styles.score} ${styles.bonus}`}
                >
                  {calculateUpperBonus(playerScores)}
                </td>
              ))}
            </tr>

            {/* Total */}
            <tr className={styles['total-row']}>
              <td className={styles.category}>Total</td>
              {Object.entries(scores).map(([player, playerScores]) => (
                <td 
                  key={player}
                  className={`${styles.score} ${styles.total}`}
                >
                  {playerScores.total + calculateUpperBonus(playerScores)}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ScoreTable;