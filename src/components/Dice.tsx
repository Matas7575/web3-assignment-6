import React from "react";

const Dice = ({ value, onRoll }: { value: number; onRoll: () => void }) => {
  return (
    <div
      onClick={onRoll}
      style={{ cursor: "pointer", padding: "10px", border: "1px solid black" }}
    >
      {value}
    </div>
  );
};

export default Dice;
