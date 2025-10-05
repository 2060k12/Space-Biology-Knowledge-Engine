import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import dataset from "../../data.json";
import * as d3 from "d3";

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

const KnowledgeGraphView = (props) => {
  // Mock data for filter and legend display
  const navigate = useNavigate();
  const [legendOpen, setLegendOpen] = useState(true);
  const [showSelected, setShowSelected] = useState(true);
  const [search, setSearch] = useState("");
  const svgRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const simulationRef = useRef(null);

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

  // Build graph data (papers, topics, authors)
  const buildGraph = () => {
    const nodes = [];
    const links = [];

    const topicMap = new Map();
    const authorMap = new Map();

    // add paper nodes
    dataset.forEach((p, i) => {
      const pid = p.id || `paper-${i + 1}`;
      nodes.push({ id: pid, label: p.title || pid, type: "paper", data: p });

      // topics
      const topics = (p.topic || "")
        .toString()
        .split(/[,;\n]/)
        .map((t) => t.trim())
        .filter(Boolean);
      topics.forEach((t) => {
        const tid = `topic:${t}`;
        if (!topicMap.has(tid)) {
          topicMap.set(tid, { id: tid, label: t, type: "topic" });
          nodes.push(topicMap.get(tid));
        }
        links.push({ source: pid, target: tid, relation: "has_topic" });
      });

      // authors (simple split by comma)
      const authors = (p.author || "")
        .toString()
        .split(/[,;&\n]/)
        .map((a) => a.trim())
        .filter(Boolean);
      authors.forEach((a) => {
        const aid = `author:${a}`;
        if (!authorMap.has(aid)) {
          authorMap.set(aid, { id: aid, label: a, type: "author" });
          nodes.push(authorMap.get(aid));
        }
        links.push({ source: pid, target: aid, relation: "written_by" });
      });
    });

    return { nodes, links };
  };

  useEffect(() => {
    const svgEl = svgRef.current;
    if (!svgEl) return;

    const { nodes, links } = buildGraph();

    const width = svgEl.clientWidth || 800;
    const height = svgEl.clientHeight || 600;

    // clear previous
    d3.select(svgEl).selectAll("*").remove();

    const svg = d3.select(svgEl).attr("viewBox", [0, 0, width, height]);

    // color scale for topics so they vary, instead of a single color
    const topicColor = d3.scaleOrdinal(d3.schemeSet3);

    const zoomBehavior = d3
      .zoom()
      .scaleExtent([0.2, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
        updateLabelVisibility(event.transform.k);
      });

    svg.call(zoomBehavior);

    const g = svg.append("g");

    const link = g
      .append("g")
      .attr("stroke", "#cbd5e1")
      .attr("stroke-opacity", 0.8)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", 1);

    const node = g
      .append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .call(
        d3
          .drag()
          .on("start", (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on("drag", (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on("end", (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      );

    node
      .append("circle")
      .attr("r", (d) => (d.type === "paper" ? 6 : d.type === "topic" ? 8 : 7))
      .attr("fill", (d) => {
        if (d.type === "paper") return "#2563eb"; // blue for papers
        if (d.type === "topic") return topicColor(d.label); // varied colors for topics
        return "#10b981"; // green for authors
      })
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .on("click", (event, d) => {
        setSelectedNode(d);
        setShowSelected(true);
        if (d.type === "paper") {
          // navigate to paper detail passing the paper in state
          const encoded = encodeURIComponent(
            (d.data && d.data.title) || d.label
          );
          navigate(`/paper/${encoded}`, { state: { paper: d.data } });
        }
      });

    // add labels for all nodes; paper labels will be hidden until zoomed in
    const labels = node
      .append("text")
      .text((d) => d.label)
      .attr("x", 10)
      .attr("y", 4)
      .attr("font-size", 11)
      .attr("fill", "#374151")
      .style("pointer-events", "none");

    // show/hide labels depending on zoom level
    function updateLabelVisibility(k) {
      // show paper labels only when sufficiently zoomed in
      labels.style("display", (d) => {
        if (d.type === "paper") return k >= 1.4 ? "block" : "none";
        // always show topic/author labels
        return "block";
      });

      // scale label font size a bit based on zoom (clamped for readability)
      labels.attr("font-size", (d) => {
        const base = d.type === "paper" ? 10 : 11;
        const scaled = Math.max(8, Math.min(20, base * k));
        return scaled;
      });
    }

    const simulation = d3
      .forceSimulation(nodes)
      .force(
        "link",
        d3
          .forceLink(links)
          .id((d) => d.id)
          .distance((d) => (d.relation === "has_topic" ? 80 : 100))
      )
      .force("charge", d3.forceManyBody().strength(-120))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .on("tick", () => {
        link
          .attr("x1", (d) => d.source.x)
          .attr("y1", (d) => d.source.y)
          .attr("x2", (d) => d.target.x)
          .attr("y2", (d) => d.target.y);

        node.attr("transform", (d) => `translate(${d.x},${d.y})`);
      });
    // expose simulation to outer scope for immediate control (stop on close)
    simulationRef.current = simulation;

    // initialize label visibility for default zoom
    updateLabelVisibility(1);

    // simple resize handling
    const handleResize = () => {
      const w = svgEl.clientWidth || 800;
      const h = svgEl.clientHeight || 600;
      svg.attr("viewBox", [0, 0, w, h]);
      simulation.force("center", d3.forceCenter(w / 2, h / 2));
      simulation.alpha(0.5).restart();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      simulation.stop();
      simulationRef.current = null;
      window.removeEventListener("resize", handleResize);
      d3.select(svgEl).selectAll("*").remove();
    };
  }, [navigate]);

  // helper values for selected node panel
  const selLabel = selectedNode?.label || "None";
  const selType = selectedNode?.type || "";
  // selCount removed (unused). Use topicCounts/authorCounts directly in UI where needed.

  return (
    <div className="w-full mx-auto py-6 px-4 sm:px-8 md:px-16 pt-12 bg-white">
      <div className="flex items-center justify-between mb-4 w-full p-4">
        <div className="flex items-center space-x-3 ">
          <button
            onClick={() => {
              // stop simulation synchronously to prevent visual "undo" effect
              try {
                if (simulationRef.current) simulationRef.current.stop();
              } catch (err) {
                console.debug("stop simulation failed", err);
              }
              // If this view was opened as a modal (props.close provided), use that.
              if (props && typeof props.close === "function") props.close();
              else navigate(-1);
            }}
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

            {/* Graph SVG area */}
            <div className="h-full w-full" style={{ minHeight: 420 }}>
              <svg
                ref={svgRef}
                className="w-full h-full"
                style={{ display: "block" }}
              />
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
            {selectedNode && (
              <div
                className={`absolute right-4 bottom-4 z-30 max-w-sm w-full transition-all ${
                  showSelected ? "" : "translate-y-6 opacity-0"
                }`}
              >
                <div className="bg-white p-4 rounded-lg shadow-xl border border-gray-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-blue-700">
                        Selected: {selLabel}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {selType} —{" "}
                        {selType === "topic" || selType === "author"
                          ? selType === "topic"
                            ? topicCounts[selLabel] || 0
                            : authorCounts[selLabel] || 0
                          : 1}{" "}
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
                    {selectedNode.data?.abstract || selectedNode.label}
                  </p>

                  <div className="mt-3 flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (selectedNode.type === "paper") {
                          const encoded = encodeURIComponent(
                            selectedNode.data.title || selectedNode.id
                          );
                          navigate(`/paper/${encoded}`, {
                            state: { paper: selectedNode.data },
                          });
                        }
                      }}
                      className="text-sm px-3 py-1 bg-indigo-600 text-white rounded-md"
                    >
                      Explore
                    </button>
                    <button
                      onClick={() => {
                        try {
                          navigator.clipboard.writeText(selectedNode.id || "");
                        } catch (err) {
                          console.debug("copy failed", err);
                        }
                      }}
                      className="text-sm px-3 py-1 bg-gray-100 rounded-md border border-gray-200"
                    >
                      Copy ID
                    </button>
                    <button
                      onClick={() => {
                        if (
                          selectedNode.type === "paper" &&
                          selectedNode.data?.pdf
                        )
                          window.open(selectedNode.data.pdf, "_blank");
                      }}
                      className="text-sm px-3 py-1 bg-gray-100 rounded-md border border-gray-200"
                    >
                      Open details
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default KnowledgeGraphView;
