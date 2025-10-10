import Chip from "../components/Chip";
import Modal from "../components/Modal";
import KnowledgeGraph from "../components/KnowledgeGraph";
import data from "../../data.json";
import { useRef, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { nanoid } from "nanoid";
import {
  RiFileList3Line,
  RiUpload2Line,
  RiNodeTree,
  RiSearchLine,
} from "@remixicon/react";
import NavigationBar from "../components/NavigationBar";

const Homepage = () => {
  const [query, setQuery] = useState("");
  const backgroundRef = useRef(null);

  // Derived stats
  const stats = useMemo(() => {
    const total = data.length;
    const authors = new Set();
    let microgravityCount = 0;
    data.forEach((d) => {
      if (d.author) authors.add(d.author);
      if (d.abstract && d.abstract.toLowerCase().includes("microgravity"))
        microgravityCount++;
    });
    return {
      total,
      authors: authors.size,
      microgravity: microgravityCount,
    };
  }, []);

  const filtered = useMemo(() => {
    if (!query) return data;
    const q = query.toLowerCase();
    return data.filter((d) => {
      return (
        (d.title && d.title.toLowerCase().includes(q)) ||
        (d.abstract && d.abstract.toLowerCase().includes(q)) ||
        (d.author && d.author.toLowerCase().includes(q))
      );
    });
  }, [query]);

  const recent = filtered.slice(0, 48);

  const navigate = useNavigate();
  const [isGraphOpen, setIsGraphOpen] = useState(false);

  return (
    <>
      <div
        className="relative w-full px-4 sm:px-8 md:px-16 pb-10 mx-auto max-w-7xl"
        ref={backgroundRef}
      >
        <div className=" w-full z-20 mb-4">
          <NavigationBar />
        </div>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">
              Dashboard
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Overview of research papers and quick actions
            </p>
          </div>

          <div className="flex gap-2 items-center">
            <div className="relative">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search papers, authors, or abstracts..."
                className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 w-72 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>

            <button
              className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50"
              onClick={() => setIsGraphOpen(true)}
            >
              <RiNodeTree />
              <span className="text-sm">Open Graph</span>
            </button>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="card p-4">
            <h3 className="text-sm text-gray-500">Total Papers</h3>
            <div className="mt-2 text-2xl font-bold text-gray-900">
              {stats.total}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Papers indexed in dataset
            </p>
          </div>
          <div className="card p-4">
            <h3 className="text-sm text-gray-500">Unique Authors</h3>
            <div className="mt-2 text-2xl font-bold text-gray-900">
              {stats.authors}
            </div>
            <p className="text-xs text-gray-400 mt-1">Distinct author names</p>
          </div>
          <div className="card p-4">
            <h3 className="text-sm text-gray-500">Microgravity Papers</h3>
            <div className="mt-2 text-2xl font-bold text-indigo-600">
              {stats.microgravity}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Papers mentioning "microgravity"
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Recent Papers list (now full width) */}
          <div className="">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                Recent Papers
              </h2>
              <div className="flex gap-2">
                <Chip
                  name="All"
                  isActive={!query}
                  onClick={() => setQuery("")}
                />
                <Chip
                  name="Microgravity"
                  onClick={() => setQuery("microgravity")}
                />
                <Chip name="Bone" onClick={() => setQuery("bone")} />
              </div>
            </div>

            <div className="space-y-4">
              {recent.map((each) => (
                <div
                  className="card p-4 cursor-pointer hover:shadow-md"
                  key={nanoid()}
                  onClick={() => {
                    // navigate to paper view; pass the paper in location state for convenience
                    navigate(`/paper/${encodeURIComponent(each.title)}`, {
                      state: { paper: each },
                    });
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900">
                        {each.title}
                      </h3>
                      <div className="text-sm text-gray-500 mt-1">
                        {each.author || "Unknown author"} •{" "}
                        <span className="text-gray-400">Link</span>
                      </div>
                    </div>
                    <div className="ml-4 text-sm text-gray-400">PDF</div>
                  </div>

                  <p className="text-sm text-gray-600 mt-3 line-clamp-3">
                    {each.abstract}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* right column removed */}
        </div>
      </div>
      <Modal
        open={isGraphOpen}
        onClose={() => setIsGraphOpen(false)}
        title="Knowledge Graph"
        size="lg"
      >
        <KnowledgeGraph />
      </Modal>
    </>
  );
};

export default Homepage;
