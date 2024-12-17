import Image from "next/image";

interface DiceProps {
  dice: number[];
  heldDice: boolean[];
  onHold: (index: number) => void;
}

const Dice: React.FC<DiceProps> = ({ dice, heldDice, onHold }) => {
  return (
    <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
      {dice.map((die, index) => (
        <button
          key={index}
          onClick={() => onHold(index)}
          style={{
            position: "relative",
            padding: "0",
            border: heldDice[index] ? "2px solid green" : "1px solid gray",
            borderRadius: "8px",
            background: "none",
            cursor: "pointer",
          }}
        >
          <Image
            src={`/assets/${die}.png`}
            alt={`Die ${die}`}
            width={60}
            height={60}
          />
          {heldDice[index] && (
            <span
              style={{
                position: "absolute",
                top: "5px",
                right: "5px",
                backgroundColor: "rgba(0, 255, 0, 0.7)",
                color: "white",
                padding: "2px 5px",
                borderRadius: "4px",
                fontSize: "12px",
              }}
            >
              Held
            </span>
          )}
        </button>
      )) || <p>No dice available</p>}
    </div>
  );
};

export default Dice;
