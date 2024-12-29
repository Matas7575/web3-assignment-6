import React from "react";

interface ScoreBoardProps {
  scores: Record<string, Record<string, number | undefined>>;
}

/**
 * ScoreTable component to display the scores of all players.
 * 
 * @param {ScoreBoardProps} props - The properties for the ScoreTable component.
 * @returns {JSX.Element | null} - The rendered ScoreTable component or null if no scores are provided.
 */
const ScoreTable: React.FC<ScoreBoardProps> = ({ scores }) => {
  if (!scores) return null;

  return (
    <div>
      <h3>Scoreboard</h3>
      <table>
        <thead>
          <tr>
            <th>Player</th>
            <th>Ones</th>
            <th>Twos</th>
            <th>Threes</th>
            <th>Fours</th>
            <th>Fives</th>
            <th>Sixes</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(scores).map(([player, score]) => (
            <tr key={player}>
              <td>{player}</td>
              <td>{score.ones || "-"}</td>
              <td>{score.twos || "-"}</td>
              <td>{score.threes || "-"}</td>
              <td>{score.fours || "-"}</td>
              <td>{score.fives || "-"}</td>
              <td>{score.sixes || "-"}</td>
              <td>{score.total || 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ScoreTable;