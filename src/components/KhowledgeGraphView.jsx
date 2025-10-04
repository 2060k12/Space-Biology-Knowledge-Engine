import {
  RiNodeTree,
  RiFilter2Line,
  RiSearchLine,
  RiInformationLine,
} from "@remixicon/react";

const KnowledgeGraphView = () => {
  // Mock data for filter and legend display
  const nodeTypes = [
    { name: "Paper", color: "bg-blue-500", count: 85 },
    { name: "Gene/Protein", color: "bg-green-500", count: 320 },
    { name: "Organism", color: "bg-purple-500", count: 12 },
    { name: "Topic", color: "bg-yellow-500", count: 40 },
    { name: "Experiment", color: "bg-red-500", count: 15 },
  ];

  return (
    <div className="w-full mx-auto max-w-7xl py-8 px-4 sm:px-8 md:px-16">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-6 flex items-center">
        <RiNodeTree className="mr-3 text-indigo-600" size={32} />
        Space Biology Knowledge Graph
      </h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Sidebar: Controls, Filters, and Legend */}
        <aside className="lg:w-1/4 p-4 bg-white rounded-xl shadow-lg border border-gray-100 flex-shrink-0">
          {/* Search Bar */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center">
              <RiSearchLine className="mr-1" size={20} /> Search Graph
            </h2>
            <input
              type="text"
              placeholder="e.g., bone density, MYC gene"
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          {/* Filters */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center">
              <RiFilter2Line className="mr-1" size={20} /> Filters
            </h2>
            <div className="space-y-2">
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

          {/* Node Type Legend */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center">
              <RiInformationLine className="mr-1" size={20} /> Legend
            </h2>
            <div className="space-y-1">
              {nodeTypes.map((type) => (
                <div
                  key={type.name}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="flex items-center">
                    <span
                      className={`w-3 h-3 ${type.color} rounded-full mr-2`}
                    ></span>
                    {type.name}
                  </span>
                  <span className="text-gray-500 text-xs">
                    {type.count} Nodes
                  </span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Right Content Area: Graph Visualization */}
        <main className="lg:w-3/4 flex-grow">
          <div className="bg-gray-50 border border-gray-200 rounded-xl shadow-inner p-4 h-[70vh] flex items-center justify-center text-gray-500 text-center relative overflow-hidden">
            {/* The actual graph rendering area (e.g., using D3.js, vis.js, or Cytoscape) */}
            <p className="text-xl font-medium">
              Knowledge Graph Visualization Area
              <br />
            </p>

            {/* Example of a graph interaction panel (for a selected node) */}
            <div className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-xl border border-blue-200 text-sm hidden lg:block">
              <h3 className="font-bold text-blue-700">
                Selected Node: Bone Density
              </h3>
              <p className="text-gray-600">Connected to 15 Papers, 8 Genes.</p>
              <button className="mt-2 text-indigo-600 hover:text-indigo-800">
                Explore in detail →
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default KnowledgeGraphView;
