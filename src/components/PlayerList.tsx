const PlayerList = ({ players }: { players: { name: string }[] }) => {
  return (
    <ul>
      {players.map((player, index) => (
        <li key={index}>{player.name}</li>
      ))}
    </ul>
  );
};

export default PlayerList;
