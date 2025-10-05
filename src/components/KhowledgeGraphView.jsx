import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import dataset from "../../data.json";

import {
  RiNodeTree,
  RiFilter2Line,
  RiSearchLine,
  RiInformationLine,
  RiArrowLeftLine,
  RiZoomInLine,
  RiZoomOutLine,
  RiDownloadLine,
  RiRefreshLine,
  RiCloseLine,
} from "@remixicon/react";

const KnowledgeGraphView = () => {
  // Mock data for filter and legend display
  const navigate = useNavigate();
  const [legendOpen, setLegendOpen] = useState(true);
  const [showSelected, setShowSelected] = useState(true);
  const [search, setSearch] = useState("");

  // derive counts from dataset
  const totalPapers = dataset.length;
  const topicCounts = {};
  const authorCounts = {};
  dataset.forEach((d) => {
    if (d.topic) {
      d.topic
        .toString()
        .split(/[,;\n]/)
        .map((t) => t.trim())
        .filter(Boolean)
        .forEach((t) => (topicCounts[t] = (topicCounts[t] || 0) + 1));
    }
    if (d.author) {
      const a = d.author.toString().trim();
      if (a) authorCounts[a] = (authorCounts[a] || 0) + 1;
    }
  });

  const nodeTypes = [
    { name: "Paper", color: "bg-blue-500", count: totalPapers },
    {
      name: "Topic",
      color: "bg-yellow-500",
      count: Object.keys(topicCounts).length,
    },
    {
      name: "Authors",
      color: "bg-green-500",
      count: Object.keys(authorCounts).length,
    },
  ];

  const topTopics = Object.entries(topicCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  // Placeholder selected node information
  const selectedNode = {
    title: "Bone Density",
    type: "Topic",
    connections: { papers: 15, genes: 8 },
    summary:
      "Bone density changes under microgravity conditions have been observed in multiple rodent and human studies. This node aggregates related experiments and genes.",
  };

  return (
    <div className="w-full mx-auto py-6 px-4 sm:px-8 md:px-16 pt-12 bg-white">
      <div className="flex items-center justify-between mb-4 w-full p-4">
        <div className="flex items-center space-x-3 ">
          <button
            onClick={() => navigate(-1)}
            title="Go back"
            className="flex items-center px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 text-sm"
          >
            <RiArrowLeftLine size={18} className="mr-2 text-gray-700" />
            Back
          </button>
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center">
            <RiNodeTree className="mr-3 text-indigo-600" size={28} />
            Space Biology Knowledge Graph
          </h1>
        </div>

        <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
          <span className="text-gray-400">You are here:</span>
          <nav className="flex items-center space-x-2">
            <span className="text-indigo-600 font-medium">Home</span>
            <span className="text-gray-300">/</span>
            <span>Knowledge Graph</span>
          </nav>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Sidebar: Controls, Filters, and Legend */}
        <aside className="lg:w-1/4 p-4 card flex-shrink-0">
          {/* Search Bar */}
          <div className="mb-4">
            <h2 className="text-lg font-bold text-gray-800 mb-2 flex items-center">
              <RiSearchLine className="mr-1" size={18} />
              Search Graph
            </h2>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="e.g., bone density, MYC gene"
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
            />
            <div className="mt-2 flex items-center gap-2">
              <button className="btn-primary text-sm">Search</button>
              <button
                onClick={() => setSearch("")}
                className="btn-ghost text-sm"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-4">
            <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
              <RiFilter2Line className="mr-1" size={18} /> Filters
            </h2>
            <div className="space-y-2 text-sm">
              <label className="flex items-center text-gray-700">
                <input
                  type="checkbox"
                  defaultChecked
                  className="form-checkbox text-indigo-600 rounded-sm"
                />
                <span className="ml-2">Show all connections</span>
              </label>
              <label className="flex items-center text-gray-700">
                <input
                  type="checkbox"
                  className="form-checkbox text-indigo-600 rounded-sm"
                />
                <span className="ml-2">Filter by Year (2020+)</span>
              </label>
              <label className="flex items-center text-gray-700">
                <input
                  type="checkbox"
                  className="form-checkbox text-indigo-600 rounded-sm"
                />
                <span className="ml-2">Focus on Microgravity</span>
              </label>
            </div>
          </div>

          {/* Node Type Legend (collapsible) */}
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800 mb-2 flex items-center">
                <RiInformationLine className="mr-1" size={18} /> Legend
              </h2>
              <button
                onClick={() => setLegendOpen(!legendOpen)}
                className="text-sm text-indigo-600 px-2 py-1 rounded"
              >
                {legendOpen ? "Hide" : "Show"}
              </button>
            </div>

            {legendOpen && (
              <div className="space-y-2">
                {nodeTypes.map((type) => (
                  <div
                    key={type.name}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="flex items-center">
                      <span
                        className={`w-3 h-3 ${type.color} rounded-full mr-2`}
                      />
                      {type.name}
                    </span>
                    <span className="text-gray-500 text-xs">{type.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* Right Content Area: Graph Visualization */}
        <main className="lg:w-3/4 flex-grow">
          <div className="bg-white border border-gray-200 rounded-xl shadow-inner p-4 h-[70vh] relative overflow-hidden">
            {/* Graph controls */}
            <div className="absolute left-4 top-4 flex items-center gap-2 z-20">
              <button className="p-2 bg-white rounded-lg border border-gray-200 shadow-sm text-sm hover:bg-gray-50">
                <RiZoomInLine size={16} />
              </button>
              <button className="p-2 bg-white rounded-lg border border-gray-200 shadow-sm text-sm hover:bg-gray-50">
                <RiZoomOutLine size={16} />
              </button>
              <button className="p-2 bg-white rounded-lg border border-gray-200 shadow-sm text-sm hover:bg-gray-50">
                <RiRefreshLine size={16} />
              </button>
              <button className="p-2 bg-white rounded-lg border border-gray-200 shadow-sm text-sm hover:bg-gray-50">
                <RiDownloadLine size={16} />
              </button>
            </div>

            {/* Placeholder for graph area (could mount Cytoscape/D3) */}
            <div className="h-full flex items-center justify-center text-gray-400 text-center px-6">
              <div>
                <p className="text-xl font-medium">
                  Knowledge Graph Visualization Area
                </p>
                <p className="text-sm mt-2 text-gray-500">
                  (Interactive graph will render here)
                </p>
              </div>
            </div>

            {/* Small insights panel */}
            <div className="absolute left-4 bottom-4 z-30 max-w-xs w-full">
              <div className="card p-3">
                <h4 className="text-sm font-semibold text-gray-700">
                  Top Topics
                </h4>
                <ul className="mt-2 text-sm text-gray-600 space-y-1">
                  {topTopics.length ? (
                    topTopics.map(([t, c]) => (
                      <li key={t} className="flex items-center justify-between">
                        <span>{t}</span>
                        <span className="text-xs text-gray-400">{c}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-xs text-gray-400">No topics found</li>
                  )}
                </ul>
              </div>
            </div>

            {/* Selected node panel */}
            <div
              className={`absolute right-4 bottom-4 z-30 max-w-sm w-full transition-all ${
                showSelected ? "" : "translate-y-6 opacity-0"
              }`}
            >
              <div className="bg-white p-4 rounded-lg shadow-xl border border-gray-200">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-blue-700">
                      Selected: {selectedNode.title}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {selectedNode.type} — {selectedNode.connections.papers}{" "}
                      papers
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowSelected(false)}
                      className="p-1 rounded hover:bg-gray-100"
                    >
                      <RiCloseLine size={16} />
                    </button>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mt-2 line-clamp-3">
                  {selectedNode.summary}
                </p>

                <div className="mt-3 flex items-center gap-2">
                  <button className="text-sm px-3 py-1 bg-indigo-600 text-white rounded-md">
                    Explore
                  </button>
                  <button className="text-sm px-3 py-1 bg-gray-100 rounded-md border border-gray-200">
                    Copy ID
                  </button>
                  <button className="text-sm px-3 py-1 bg-gray-100 rounded-md border border-gray-200">
                    Open details
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default KnowledgeGraphView;
