import React from "react";

const Chip = (props) => {
  return (
    <div onClick={props.onClick}>
      <h3
        className={`${
          props.isActive ? "bg-gray-900" : "bg-gray-600"
        }  text-white px-3 py-1 rounded-xl hover:bg-gray-800 cursor-pointer`}
      >
        {props.name}
      </h3>
    </div>
  );
};

export default Chip;
