import AiSearch from "../components/AiSearch";
import Chip from "../components/Chip";
import SearchModal from "../components/SearchModal";
import data from "../../public/abstracts.json";
import PublicationsView from "../components/PublicationsView";
import { useRef, useState } from "react";
import { nanoid } from "nanoid";
const Homepage = () => {
  const [openModel, setOpenModel] = useState(false);
  const [clickedPaper, setClickedPaper] = useState(null);
  const backgroundRef = useRef(null);
  return (
    <>
      <div className="relative flex-1 w-full px-16 " ref={backgroundRef}>
        <h1 className="text-3xl">Research Paper</h1>
        <div className="py-2 my-2rounded-xl">
          <div className="flex flex-wrap gap-x-1 gap-y-1 my-2">
            <Chip name="All" isActive={true} />
            <Chip name="Micrograviy" />
            <Chip name="Radiation" />
            <Chip name="Bone Density" />
            <Chip name="Metabolism1" />
            <Chip name="Cell biolars" />
            <Chip name="Micrograviy" />
            <Chip name="Radiation" />
            <Chip name="Bone Density" />
          </div>
        </div>

        <div className="flex flex-col gap-2 ">
          {data.map((each) => (
            <div
              className="bg-gray-200 rounded-2xl p-4 shadow-xs "
              key={nanoid()}
              onClick={() => {
                setOpenModel(true);
                setClickedPaper(each);
              }}
            >
              <h1 className="text-xl font-bold">{each.title}</h1>
              <h2 className="text-lg ">
                {each.author || "Pranish Pathak, Utsav Poudel"}
              </h2>
              <h2 className="text-lg line-clamp-2">{each.abstract}</h2>
            </div>
          ))}
        </div>

        {/* <div className="absolute rounded-2xl left-1/2 bottom-2 max-w-[1200px] transform -translate-x-1/2 w-3/4 h-4/5 bg-gray-100 flex  justify-center z-0 ">
        <SearchModal />
      </div> */}
      </div>

      {openModel && (
        <div className="w-full h-full fixed justify-center items-center flex ">
          <PublicationsView
            paper={clickedPaper}
            close={(e) => {
              setOpenModel(e);
              setClickedPaper(null);
            }}
          />
        </div>
      )}
    </>
  );
};

export default Homepage;
