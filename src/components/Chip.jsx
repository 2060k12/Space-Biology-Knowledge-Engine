import React from "react";

const Chip = (props) => {
  const baseClasses =
    "py-1 px-3 rounded-full text-sm font-medium transition duration-200 ease-in-out cursor-pointer whitespace-nowrap";

  const activeClasses = "bg-blue-600 text-white shadow-md hover:bg-blue-700";

  const inactiveClasses =
    "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200";

  return (
    <div onClick={props.onClick}>
      <h3
        className={`${baseClasses} ${
          props.isActive ? activeClasses : inactiveClasses
        }`}
      >
        {props.name}
      </h3>
    </div>
  );
};

export default Chip;
