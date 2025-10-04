import Chip from "../components/Chip";
import data from "../../data.json";
import PublicationsView from "../components/PublicationsView";
import { useRef, useState } from "react";
import { nanoid } from "nanoid";

const Homepage = () => {
  const [openModel, setOpenModel] = useState(false);
  const [clickedPaper, setClickedPaper] = useState(null);
  const backgroundRef = useRef(null);

  return (
    <>
      {openModel && (
        <div className="fixed inset-0 bg-[#00000076]  flex items-center justify-center z-50 p-4">
          <PublicationsView
            paper={clickedPaper}
            close={(e) => {
              setOpenModel(e);
              setClickedPaper(null);
            }}
          />
        </div>
      )}

      <div
        className="relative w-full px-4 sm:px-8 md:px-16 pb-10 mx-auto max-w-7xl"
        ref={backgroundRef}
      >
        {/* Header and Filter */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4 sm:mb-0">
            Research Papers
          </h1>

          <select className="border border-gray-300 rounded-lg p-2 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out">
            <option>Filter by Year</option>
            <option>2025</option>
            <option>2024</option>
            <option>2023</option>
            <option>2022</option>
          </select>
        </div>

        <div className="py-4 mb-6 border-b border-gray-200">
          <div className="flex flex-wrap gap-2">
            {/* The Chip component itself should be styled better (e.g., rounded, light background, clear active state) */}
            <Chip name="All" isActive={true} />
            <Chip name="Microgravity" />
            <Chip name="Radiation" />
            <Chip name="Bone Density" />
            <Chip name="Metabolism" />
            <Chip name="Cell Biology" />
            {/* ... other chips */}
          </div>
        </div>

        <div className="flex flex-col gap-4 pb-20">
          {data.map((each) => (
            <div
              className="bg-white rounded-xl p-5 shadow-lg hover:shadow-xl transition duration-300 ease-in-out cursor-pointer transform hover:-translate-y-0.5 border border-gray-100 hover:ring-2 hover:ring-blue-400"
              key={nanoid()}
              onClick={() => {
                setOpenModel(true);
                setClickedPaper(each);
                console.log("clicked");
              }}
            >
              <h1 className="text-xl font-bold text-blue-700 mb-1">
                {each.title}
              </h1>
              <h2 className="text-base font-medium text-gray-600 mb-2">
                {each.author || "Pranish Pathak, Utsav Poudel"}
              </h2>
              <h2 className="text-sm text-gray-500 line-clamp-3">
                {each.abstract}
              </h2>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Homepage;
