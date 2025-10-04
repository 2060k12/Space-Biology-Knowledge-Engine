import { RiCloseFill, RiNodeTree } from "@remixicon/react"; // RiNodeTree imported for the graph button
import { useEffect, useState } from "react";
import KnowledgeGraphView from "./KhowledgeGraphView";

const PublicationsView = (props) => {
  useEffect(() => {}, []);
  const [openGraphModel, setOpenGraphModel] = useState(false);

  return (
    <>
      {openGraphModel && (
        <div className="fixed inset-0 bg-[#00000063]  flex items-center justify-center z-50 p-4">
          <KnowledgeGraphView
            paper={props.paper} // Pass paper data if the graph is paper-specific
            close={() => setOpenGraphModel(false)}
          />
        </div>
      )}

      <div className="bg-white max-w-5xl w-full max-h-[70vh] rounded-2xl p-6 md:p-8 md:pt-0 shadow-2xl overflow-y-auto transform transition-all duration-300">
        {/* FIX: Moved the buttons into a dedicated flex container in the header */}
        <div className="flex justify-between items-start border-b pb-4 pt-8 mb-4 sticky top-0 bg-white z-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 pr-4">
            {props.paper?.title || "Research Paper Title"}
          </h1>

          <div className="flex gap-2 items-center flex-shrink-0">
            {/* Knowledge Graph Button */}
            <button
              onClick={() => setOpenGraphModel(true)}
              className="p-2 text-indigo-600 border border-indigo-200 rounded-full hover:bg-indigo-50 transition duration-150 ease-in-out shadow-sm"
              aria-label="View Knowledge Graph"
              title="View Knowledge Graph"
            >
              <RiNodeTree size={20} />
            </button>

            {/* Close Button */}
            <button
              onClick={() => props.close(false)}
              className="p-2 text-red-600 rounded-full hover:bg-red-50 transition duration-150 ease-in-out"
              aria-label="Close"
            >
              <RiCloseFill size={28} />
            </button>
          </div>
        </div>

        {/* Metadata Grid (The button has been removed from here) */}
        <div className="mb-6 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm md:text-base">
          <div className="p-3 bg-blue-50/70 rounded-lg">
            <h4 className="font-semibold text-gray-500 mb-0.5">Author</h4>
            <p className="text-gray-800 font-medium">
              {props.paper?.author || "N/A"}
            </p>
          </div>
          <div className="p-3 bg-blue-50/70 rounded-lg">
            <h4 className="font-semibold text-gray-500 mb-0.5">Year</h4>
            <p className="text-gray-800 font-medium">
              {props.paper?.year || "N/A"}
            </p>
          </div>
          <div className="p-3 bg-blue-50/70 rounded-lg">
            <h4 className="font-semibold text-gray-500 mb-0.5">Topics</h4>
            <p className="text-gray-800 font-medium line-clamp-2">
              {props.paper?.topic || "N/A"}
            </p>
          </div>
          <div className="p-3 bg-blue-50/70 rounded-lg">
            <h4 className="font-semibold text-gray-500 mb-0.5">Organisms</h4>
            <p className="text-gray-800 font-medium line-clamp-2">
              {props.paper?.organism || "N/A"}
            </p>
          </div>
          <div className="p-3 bg-blue-50/70 rounded-lg">
            <h4 className="font-semibold text-gray-500 mb-0.5">Citations</h4>
            <p className="text-gray-800 font-medium">
              {props.paper?.citation || "N/A"}
            </p>
          </div>
        </div>

        {/* Abstract/Key Findings Section */}
        <section className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-3 border-b pb-1">
            Abstract / Key Findings
          </h2>
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-gray-700 leading-relaxed">
              {props.paper?.abstract ||
                `Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ratione
            voluptatem sit a repellendus natus explicabo molestiae minus veritatis
            cupiditate velit.`}
            </p>
          </div>
        </section>

        {/* Generated Summary Section */}
        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3 border-b pb-1">
            Generated Summary
          </h2>
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-gray-700 leading-relaxed">
              Lorem ipsum dolor sit amet consectetur, adipisicing elit.
              Accusamus ea ut saepe quidem ab dignissimos earum! Iste totam
              error ab libero impedit officiis saepe facilis quis aliquid qui
              commodi veniam, sed adipisci. Accusamus ducimus quis est quidem
              optio animi eos iste eius, repudiandae iusto reiciendis hic
              excepturi harum maxime inventore.
            </p>
          </div>
        </section>
      </div>
    </>
  );
};

export default PublicationsView;
