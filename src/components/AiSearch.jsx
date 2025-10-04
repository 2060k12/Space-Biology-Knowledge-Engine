import { useState } from "react";
import { useRef } from "react";
import { RiArrowUpLine, RiSparkling2Fill } from "@remixicon/react";

const AiSearch = () => {
  const inputRef = useRef(null);
  const searchButtonRef = useRef(null);
  const [search, setSearch] = useState("");

  const handleSearchTextChange = (e) => {
    setSearch(e.target.value);

    if (e.target.value !== "") {
      searchButtonRef.current.style.display = "flex";
    } else {
      searchButtonRef.current.style.display = "none";
    }
  };

  const handleSearch = () => {
    if (event) {
      event.stopPropagation();
    }
    alert(`Searching for: ${search}`);
  };

  return (
    <div className="flex justify-center w-full py-4">
      <div
        className="bg-white border border-gray-300 shadow-xl p-3 text-lg rounded-2xl w-full max-w-xl flex gap-3 items-center hover:shadow-lg transition duration-200 ease-in-out cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {/* 2. Icon: Using the RiSparkling2Fill for an "AI" feel. */}
        <RiSparkling2Fill className="text-blue-500 flex-shrink-0" size={24} />

        <input
          ref={inputRef}
          type="text"
          placeholder="Ask AI about space biology..."
          className="w-full outline-none text-gray-800 placeholder-gray-500 bg-transparent"
          value={search}
          onChange={handleSearchTextChange}
          onKeyDown={(e) => {
            if (search !== "" && e.key === "Enter") {
              handleSearch();
            }
          }}
        />

        <button
          ref={searchButtonRef}
          onClick={handleSearch}
          aria-label="Submit Search"
          className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-blue-700 transition duration-150 ease-in-out cursor-pointer hidden flex-shrink-0"
          style={{ display: search ? "flex" : "none" }} // Inline style to override initial hidden class on mount
        >
          <RiArrowUpLine size={20} />
        </button>
      </div>
    </div>
  );
};

export default AiSearch;
