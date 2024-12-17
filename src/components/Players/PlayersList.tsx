interface PlayersListProps {
  players: string[];
}

const PlayersList: React.FC<PlayersListProps> = ({ players }) => (
  <ul>
    {players.map((player) => (
      <li key={player}>{player}</li>
    ))}
  </ul>
);

export default PlayersList;
