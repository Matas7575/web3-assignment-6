// PlayersList.tsx
import styles from '@/styles/PlayerList.module.css';

/**
 * Props for the PlayersList component.
 * 
 * @interface PlayersListProps
 * @property {string[]} players - Array of player usernames
 * @property {string} currentPlayer - Username of the current player
 * @property {string} host - Username of the game host
 * @property {(player: string) => void} [onRemovePlayer] - Optional callback to remove a player
 */
export interface PlayersListProps {
  players: string[];
  currentPlayer: string;
  host: string;
  onRemovePlayer?: (player: string) => void;
}

/**
 * Displays a list of players in the game with their status and roles.
 * Highlights the current player and shows who is the host.
 * Allows the host to remove other players if the game hasn't started.
 * 
 * @module Components
 * @category Game
 * @example
 * // Basic usage
 * <PlayersList
 *   players={["player1", "player2"]}
 *   currentPlayer="player1"
 *   host="player1"
 * />
 * 
 * @example
 * // With remove player functionality
 * <PlayersList
 *   players={["player1", "player2"]}
 *   currentPlayer="player1"
 *   host="player1"
 *   onRemovePlayer={(player) => handleRemovePlayer(player)}
 * />
 */
const PlayersList: React.FC<PlayersListProps> = ({ 
  players, 
  currentPlayer, 
  host 
}) => {
  console.log('PlayersList received props:', { players, currentPlayer, host });
  
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Players</h2>
      <ul className={styles.list}>
        {players.map((player) => (
          <li 
            key={player} 
            className={`${styles['list-item']} ${
              player === currentPlayer ? styles.active : ''
            }`}
          >
            <div className={styles['player-info']}>
              <span className={styles['player-name']}>
                {player} {player === host && ' (Host)'}
              </span>
              {player === currentPlayer && (
                <span className={styles['turn-indicator']}>
                  Current Turn
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PlayersList;