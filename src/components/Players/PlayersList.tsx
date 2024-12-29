/**
 * Props for the PlayersList component.
 */
interface PlayersListProps {
  players: string[];
}

/**
 * PlayersList component to display a list of players.
 * 
 * @param {PlayersListProps} props - The properties for the PlayersList component.
 * @returns {JSX.Element} - The rendered PlayersList component.
 */
const PlayersList: React.FC<PlayersListProps> = ({ players }) => (
  <ul>
    {players.map((player) => (
      <li key={player}>{player}</li>
    ))}
  </ul>
);

export default PlayersList;