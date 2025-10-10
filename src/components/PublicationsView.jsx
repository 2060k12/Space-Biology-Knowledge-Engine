import {
  RiCloseFill,
  RiNodeTree,
  RiExternalLinkLine,
  RiFileDownloadLine,
  RiShareLine,
} from "@remixicon/react";
import { useEffect, useState, useRef } from "react";
import KnowledgeGraphView from "./KhowledgeGraphView";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import dataset from "../../data.json";

const PublicationsView = (props) => {
  const containerRef = useRef(null);
  const [openGraphModel, setOpenGraphModel] = useState(false);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();

  const paperFromState = location?.state?.paper;
  const paperFromParam = params?.id
    ? dataset.find((d) => encodeURIComponent(d.title) === params.id)
    : null;
  const paper = paperFromState || paperFromParam || props.paper || null;

  useEffect(() => {
    try {
      if (containerRef.current)
        containerRef.current.scrollTo({ top: 0, behavior: "auto" });
    } catch (err) {
      console.debug("scroll to top failed", err);
    }
  }, [paper]);

  return (
    <>
      {openGraphModel && (
        <div className="fixed inset-0 bg-[#00000063]  flex items-center justify-center z-50 p-4">
          <KnowledgeGraphView
            paper={paper}
            close={() => setOpenGraphModel(false)}
          />
        </div>
      )}

      <div
        ref={containerRef}
        className="card w-full min-h-screen px-6 md:px-8 md:pt-0 transform transition-all duration-300"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between border-b pb-4 pt-6 mb-4 sticky top-0 bg-white z-10">
          <div className="flex-1 pr-4">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-gray-900 leading-tight">
              {paper?.title || "Research Paper Title"}
            </h1>
            <p className="text-sm text-gray-500 mt-2">
              {paper?.author || "Unknown author"} • {paper?.year || "N/A"}
            </p>
          </div>

          <div className="mt-3 md:mt-0 flex gap-2 items-center">
            <div className="flex gap-2 items-center">
              <button
                onClick={() => setOpenGraphModel(true)}
                className="btn-ghost inline-flex items-center gap-2"
                aria-label="View Knowledge Graph"
                title="View Knowledge Graph"
              >
                <RiNodeTree size={18} />
                <span className="hidden md:inline text-sm font-medium">
                  Graph
                </span>
              </button>
            </div>

            {/* Action group */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const url = paper.link || "";
                  if (url)
                    window.open(
                      url.startsWith("http") ? url : `https://doi.org/${url}`,
                      "_blank"
                    );
                }}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-white border border-gray-200 hover:shadow-sm"
                title="Open DOI / URL"
              >
                <RiExternalLinkLine />
                <span className="hidden sm:inline text-sm">Open</span>
              </button>

              <button
                onClick={async () => {
                  const cite = `${paper?.author || ""} - ${
                    paper?.title || ""
                  } (${paper?.year || ""})`;
                  try {
                    await navigator.clipboard.writeText(cite);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1800);
                  } catch (e) {
                    console.error(e);
                  }
                }}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-white border border-gray-200 hover:shadow-sm"
                title="Copy citation"
              >
                <RiShareLine />
                <span className="hidden sm:inline text-sm">Copy</span>
              </button>

              {/* Close button moved to the end and highlighted in red */}
              <button
                onClick={() => {
                  if (params?.id || location?.state?.paper) navigate(-1);
                  else if (props.close) props.close(false);
                }}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-red-600 text-white border border-red-700 hover:bg-red-700"
                aria-label="Close"
                title="Close"
              >
                <RiCloseFill size={18} />
                <span className="hidden md:inline text-sm">Close</span>
              </button>
            </div>
          </div>
        </div>

        {/* Abstract/Key Findings Section - moved up */}
        <section className="mb-6">
          <div className="mb-4">
            <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-3">
              Abstract / Key Findings
            </h2>
            <div className="p-6 bg-white border border-gray-100 rounded-lg shadow-sm">
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {paper?.abstract || `No abstract available.`}
              </p>
            </div>
          </div>
        </section>

        {/* Metadata: render all available fields from the paper object (except title and abstract) */}
        <div className="mb-6 grid grid-cols-1 gap-4 text-sm md:text-base">
          {paper ? (
            <div className="p-4 bg-white border border-gray-100 rounded-lg shadow-sm">
              <h4 className="font-semibold text-gray-600 mb-3">Metadata</h4>
              <div className="space-y-3">
                {Object.entries(paper)
                  .filter(([k]) => k !== "title" && k !== "abstract")
                  .map(([k, v]) => {
                    // skip empty values
                    if (v === null || v === undefined) return null;
                    const str =
                      typeof v === "string" ? v.trim() : JSON.stringify(v);
                    if (!str) return null;
                    return (
                      <div key={k} className="md:flex md:items-start md:gap-6">
                        <div className="w-full md:w-48 text-xs text-gray-500 capitalize mb-1 md:mb-0">
                          {k.replace(/_/g, " ")}
                        </div>
                        <div className="text-gray-800 leading-relaxed whitespace-pre-line w-full">
                          {str}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          ) : (
            <div className="p-3 bg-blue-50/60 rounded-lg">
              No metadata available
            </div>
          )}
        </div>

        {copied && (
          <div className="fixed right-6 bottom-6 bg-black text-white px-4 py-2 rounded-md shadow-lg">
            Citation copied
          </div>
        )}
      </div>
    </>
  );
};

export default PublicationsView;
