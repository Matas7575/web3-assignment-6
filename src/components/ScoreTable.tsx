import React from "react";

const ScoreTable = ({
  players,
}: {
  players: { name: string; score: number }[];
}) => {
  return (
    <table>
      <thead>
        <tr>
          <th>Player</th>
          <th>Score</th>
        </tr>
      </thead>
      <tbody>
        {players.map((player, index) => (
          <tr key={index}>
            <td>{player.name}</td>
            <td>{player.score}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ScoreTable;
