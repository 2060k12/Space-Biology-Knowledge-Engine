import { useState, useRef } from "react";
import { RiArrowUpLine, RiSearchLine } from "@remixicon/react";

const SearchBar = () => {
  const inputRef = useRef(null);
  const searchButtonRef = useRef(null);
  const [query, setQuery] = useState("");

  const handleChange = (e) => {
    setQuery(e.target.value);
    if (e.target.value !== "") {
      searchButtonRef.current.style.display = "flex";
    } else {
      searchButtonRef.current.style.display = "none";
    }
  };

  const handleSearch = (ev) => {
    if (ev && ev.stopPropagation) ev.stopPropagation();

    alert(`Searching for: ${query}`);
  };

  return (
    <div className="flex justify-center w-full py-4">
      <div
        className="bg-white border border-gray-300 shadow-xl p-3 text-lg rounded-2xl w-full max-w-xl flex gap-3 items-center hover:shadow-lg transition duration-200 ease-in-out cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        <RiSearchLine className="text-blue-500 flex-shrink-0" size={24} />

        <input
          ref={inputRef}
          type="text"
          placeholder="Search space biology publications..."
          className="w-full outline-none text-gray-800 placeholder-gray-500 bg-transparent"
          value={query}
          onChange={handleChange}
          onKeyDown={(e) => {
            if (query !== "" && e.key === "Enter") {
              handleSearch(e);
            }
          }}
        />

        <button
          ref={searchButtonRef}
          onClick={handleSearch}
          aria-label="Submit Search"
          className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-blue-700 transition duration-150 ease-in-out cursor-pointer flex-shrink-0"
          style={{ display: query ? "flex" : "none" }}
        >
          <RiArrowUpLine size={20} />
        </button>
      </div>
    </div>
  );
};

export default SearchBar;
