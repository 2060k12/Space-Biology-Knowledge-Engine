import React from "react";

const Chip = (props) => {
  const active = props.isActive;
  return (
    <button
      onClick={props.onClick}
      className={`chip ${
        active ? "bg-indigo-600 text-white border-transparent" : ""
      }`}
      aria-pressed={active}
    >
      {props.name}
    </button>
  );
};

export default Chip;
