import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import dataset from "../../data.json";
import * as d3 from "d3";
import { generateGraphData } from "../api/graphGenerator";

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
  const svgRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const simulationRef = useRef(null);
  const paper = props?.paper;

  // Build quick aggregates from the canonical graph generator so the side
  // panel shows correct counts that match the visualization.
  const { nodes: allNodes, edges: allEdges } = generateGraphData(dataset);

  const pubCount = allNodes.filter((n) => n.type === "publication").length;
  const sectionCount = allNodes.filter((n) => n.type === "section").length;
  const keywordCount = allNodes.filter((n) => n.type === "keyword").length;

  const nodeTypes = [
    { name: "Publication", color: "bg-blue-500", count: pubCount },
    { name: "Section", color: "bg-yellow-500", count: sectionCount },
    { name: "Keyword", color: "bg-green-500", count: keywordCount },
  ];

  // top keywords derived from edges (target counts)
  const keywordCounts = {};
  const sectionCounts = {};
  const nodeTypeMap = allNodes.reduce((m, n) => {
    m[n.id] = n.type;
    return m;
  }, {});
  allEdges.forEach((e) => {
    const tid = e.target;
    if (nodeTypeMap[tid] === "keyword")
      keywordCounts[tid] = (keywordCounts[tid] || 0) + 1;
    if (nodeTypeMap[tid] === "section")
      sectionCounts[tid] = (sectionCounts[tid] || 0) + 1;
  });
  const topTopics = Object.entries(keywordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  // NOTE: graph building logic is inlined inside useEffect so we can easily
  // build a focused subgraph when `props.paper` is provided (no external deps).

  useEffect(() => {
    const svgEl = svgRef.current;
    if (!svgEl) return;
    // Use the canonical graph shape so this view matches the embedded one.
    const { nodes: rawNodes, edges: rawEdges } = generateGraphData(dataset);

    // Map nodes to include a label and attach the original publication object for
    // publication nodes so the selected panel / navigation can access it.
    const nodes = rawNodes.map((n) => {
      const obj = { ...n, label: n.id };
      if (n.type === "publication") {
        const p = dataset.find((d) => d.title === n.id || d.id === n.id);
        if (p) obj.data = p;
      }
      return obj;
    });

    // Edges in generateGraphData use source/target ids that d3.forceLink will
    // resolve via .id((d)=>d.id) so we can pass them through directly.
    const links = rawEdges.map((e) => ({ source: e.source, target: e.target }));

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
      .attr("r", (d) =>
        d.type === "publication" ? 8 : d.type === "section" ? 6 : 6
      )
      .attr("fill", (d) => {
        if (d.type === "publication") return "#2563eb"; // blue for pubs
        if (d.type === "section") return topicColor(d.label); // varied colors for sections
        return "#10b981"; // green for keywords
      })
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .on("click", (event, d) => {
        setSelectedNode(d);
        setShowSelected(true);
        if (d.type === "publication") {
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
          .distance(80)
      )
      .force("charge", d3.forceManyBody().strength(-200))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .on("tick", () => {
        link
          .attr("x1", (d) => d.source.x)
          .attr("y1", (d) => d.source.y)
          .attr("x2", (d) => d.target.x)
          .attr("y2", (d) => d.target.y);

        node.attr("transform", (d) => `translate(${d.x},${d.y})`);
      });
    // If this view is opened from a specific paper, try to find that
    // publication node and focus/zoom to it.
    if (paper) {
      const searchId = paper.title || paper.id;
      const centralNode = nodes.find((n) => n.id === searchId);
      if (centralNode) {
        simulation.alpha(0.6).restart();
        simulation.on("end.focus", () => {
          try {
            const k = 1.25;
            const transform = d3.zoomIdentity
              .translate(
                width / 2 - centralNode.x * k,
                height / 2 - centralNode.y * k
              )
              .scale(k);
            svg
              .transition()
              .duration(700)
              .call(zoomBehavior.transform, transform);
            setSelectedNode(centralNode);
            setShowSelected(true);
          } catch (err) {
            console.debug("focus transform failed", err);
          }
        });
      }
    }
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
  }, [navigate, paper]);

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
            {paper?.title ? paper.title : "Space Biology Knowledge Graph"}
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
        {/* Left Sidebar: Legend and quick stats */}
        <aside className="lg:w-1/4 p-4 card flex-shrink-0">
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
                        {selType === "keyword"
                          ? keywordCounts[selLabel] || 0
                          : selType === "section"
                          ? sectionCounts[selLabel] || 0
                          : selType === "publication"
                          ? 1
                          : 0}{" "}
                        papers
                      </p>
                      {/* Intentionally hide author/tags details for publication view per request */}
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
                        if (
                          selectedNode.type === "publication" &&
                          selectedNode.data?.link
                        ) {
                          window.open(selectedNode.data.link, "_blank");
                        } else if (selectedNode.type === "publication") {
                          // fallback to navigate to internal page if no external link
                          const encoded = encodeURIComponent(
                            selectedNode.data?.title || selectedNode.id
                          );
                          navigate(`/paper/${encoded}`, {
                            state: { paper: selectedNode.data },
                          });
                        }
                      }}
                      className="text-sm px-3 py-1 bg-indigo-600 text-white rounded-md"
                    >
                      Open
                    </button>
                    {/* Copy ID and PDF buttons removed per request */}
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
