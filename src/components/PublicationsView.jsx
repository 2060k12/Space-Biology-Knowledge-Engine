import {
  RiCloseFill,
  RiNodeTree,
  RiExternalLinkLine,
  RiFileDownloadLine,
  RiShareLine,
} from "@remixicon/react";
import { useEffect, useState, useRef } from "react";
import KnowledgeGraphView from "./KhowledgeGraphView";
import Chip from "./Chip";
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
        className="card w-full h-screen px-6 md:px-8 md:pt-0 overflow-y-auto transform transition-all duration-300"
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

              <button
                onClick={() => {
                  // If opened via route, go back in history, otherwise call close prop
                  if (params?.id || location?.state?.paper) navigate(-1);
                  else if (props.close) props.close(false);
                }}
                className="btn-ghost inline-flex items-center gap-2"
                aria-label="Close"
                title="Close"
              >
                <RiCloseFill size={20} />
                <span className="hidden md:inline text-sm">Close</span>
              </button>
            </div>

            {/* Action group */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const url = paper?.url || paper?.doi || "";
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
                onClick={() => {
                  const pdf = paper?.pdf;
                  if (pdf) window.open(pdf, "_blank");
                  else alert("No PDF available");
                }}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-white border border-gray-200 hover:shadow-sm"
                title="Download PDF"
              >
                <RiFileDownloadLine />
                <span className="hidden sm:inline text-sm">PDF</span>
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
            </div>
          </div>
        </div>

        {/* Metadata */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm md:text-base">
          <div className="p-3 bg-blue-50/60 rounded-lg">
            <h4 className="font-semibold text-gray-500 mb-1">Authors</h4>
            <p className="text-gray-800 font-medium">
              {paper?.author || "N/A"}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {paper?.affiliation || ""}
            </p>
          </div>

          <div className="p-3 bg-blue-50/60 rounded-lg">
            <h4 className="font-semibold text-gray-500 mb-1">Details</h4>
            <p className="text-gray-800 font-medium">
              Year: {paper?.year || "N/A"}
            </p>
            <p className="text-gray-800 font-medium mt-1">
              Citations: {paper?.citation || "0"}
            </p>
          </div>

          <div className="p-3 bg-blue-50/60 rounded-lg">
            <h4 className="font-semibold text-gray-500 mb-1">Tags</h4>
            <div className="flex gap-2 flex-wrap mt-2">
              {/* Topics */}
              {(paper?.topic || "")
                .toString()
                .split(",")
                .filter(Boolean)
                .slice(0, 6)
                .map((t, i) => (
                  <Chip key={`topic-${i}`} name={t.trim()} />
                ))}

              {/* Organisms */}
              {(paper?.organism || "")
                .toString()
                .split(/[,;\n]/)
                .filter(Boolean)
                .slice(0, 6)
                .map((o, i) => (
                  <Chip key={`org-${i}`} name={o.trim()} />
                ))}
            </div>
          </div>
        </div>

        {/* Abstract/Key Findings Section */}
        <section className="mb-6">
          <div className="mb-4">
            <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-3">
              Abstract / Key Findings
            </h2>
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {paper?.abstract || `No abstract available.`}
              </p>
            </div>
          </div>
        </section>

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
