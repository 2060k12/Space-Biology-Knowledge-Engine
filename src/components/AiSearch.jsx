import { useState } from "react";
import { useRef } from "react";
import {
  RiArrowUpFill,
  RiArrowUpLine,
  RiSearchLine,
  RiSparkling2Fill,
} from "@remixicon/react";
const AiSearch = () => {
  const inputRef = useRef(null);
  const searchButtonRef = useRef(null);
  const [search, setSearch] = useState("");
  const handleSearchTextChange = (e) => {
    setSearch(e.target.value);
    if (e.target.value !== "") {
      searchButtonRef.current.style.display = "block";
    } else {
      searchButtonRef.current.style.display = "none";
    }
  };

  const handleSearch = () => {
    alert("Search");
  };

  return (
    <div
      className="bg-gray-200 m-2 p-4 text-xl rounded-2xl w-1/2 max-w-[600px] flex gap-2 items-center hover:cursor-text shadow-xs border-gray-300 border-1"
      onClick={() => inputRef.current?.focus()}
    >
      <RiSearchLine className="hover:cursor-pointer" />
      <input
        ref={inputRef}
        type="text"
        placeholder="Ask AI"
        className="w-full outline-none"
        value={search}
        onChange={handleSearchTextChange}
        onKeyDown={(e) => {
          if (search !== "" && e.key === "Enter") {
            handleSearch();
          }
        }}
      />

      <RiArrowUpLine
        ref={searchButtonRef}
        size={26}
        className="bg-white rounded-[50%] p-[6px] w-[35px] h-[28px] cursor-pointer hidden"
        onClick={handleSearch}
      />
    </div>
  );
};

export default AiSearch;
