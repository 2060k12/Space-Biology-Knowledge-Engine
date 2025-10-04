import React from "react";
import Chip from "./Chip";

const SearchModal = () => {
  return (
    <div className="flex flex-col p-4 ">
      <div className="flex gap-x-2 gap-y-1 flex-wrap ">
        <Chip name="Research Papers" />
        <Chip name="Insights" />
        <Chip name="Knowledge Graphs" />
      </div>

      {/* Papers */}
      <div className="bg-gray-200 p-2 rounded-xl font-bold">
        <h1>Paper Name</h1>
      </div>
    </div>
  );
};

export default SearchModal;
