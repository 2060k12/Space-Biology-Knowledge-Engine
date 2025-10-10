import * as d3 from "d3";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { generateGraphData } from "../api/graphGenerator";
import data from "../../data.json";

export default function KnowledgeGraph() {
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const { nodes, edges } = generateGraphData(data);

    const container = containerRef.current;
    const svgEl = svgRef.current;
    if (!container || !svgEl) return;

    // clear any existing
    d3.select(svgEl).selectAll("*").remove();

    const width = container.clientWidth;
    const height = container.clientHeight;

    const svg = d3
      .select(svgEl)
      .attr("width", width)
      .attr("height", height)
      .style("display", "block")
      .style("background", "#fff");

    // defs for markers
    svg
      .append("defs")
      .append("marker")
      .attr("id", "arrow")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 15)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#bbb");

    // add a group for pan/zoom
    const g = svg.append("g").attr("class", "viewport");

    // links
    const link = g
      .append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(edges)
      .enter()
      .append("line")
      .attr("stroke", "#cbd5e1")
      .attr("stroke-width", 1.2)
      .attr("marker-end", "url(#arrow)");

    // color scale: match modal's style (publication blue, sections varied, keywords green)
    const topicColor = d3.scaleOrdinal(d3.schemeSet3);
    const color = (d) => {
      if (d.type === "publication") return "#2563eb"; // blue for pubs (match modal)
      if (d.type === "section") return topicColor(d.id); // varied colors for sections
      return "#10b981"; // green for keywords (match modal)
    };

    // nodes
    const node = g
      .append("g")
      .attr("class", "nodes")
      .selectAll("g")
      .data(nodes)
      .enter()
      .append("g")
      .attr("class", "node-group")
      .call(
        d3
          .drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended)
      );

    node
      .append("circle")
      .attr("r", (d) =>
        d.type === "publication" ? 8 : d.type === "section" ? 6 : 6
      )
      .attr("fill", (d) => color(d))
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .attr("opacity", 0.98);
    // make publication nodes appear clickable
    node
      .select("circle")
      .style("cursor", (d) =>
        d.type === "publication" ? "pointer" : "default"
      );

    // labels: show for publications by default, hide for others and show on hover
    node
      .append("text")
      .attr("class", "node-label")
      .text((d) =>
        d.type === "publication"
          ? d.id.length > 60
            ? d.id.slice(0, 60) + "..."
            : d.id
          : ""
      )
      .attr("font-size", 11)
      .attr("fill", "#111827")
      .attr("dx", 18)
      .attr("dy", ".35em");

    // tooltip (match modal styling)
    const tooltip = d3
      .select(container)
      .append("div")
      .attr("class", "kg-tooltip")
      .style("position", "absolute")
      .style("pointer-events", "none")
      .style("background", "rgba(0,0,0,0.75)")
      .style("color", "#fff")
      .style("padding", "6px 8px")
      .style("border-radius", "6px")
      .style("font-size", "12px")
      .style("display", "none")
      .style("z-index", 60);

    node
      .on("mouseenter", function (event, d) {
        d3.select(this)
          .select("circle")
          .attr("stroke", "#000")
          .attr("stroke-width", 2);
        // show label for non-publication
        d3.select(this)
          .select("text.node-label")
          .text(d.id.length > 80 ? d.id.slice(0, 80) + "..." : d.id);
        tooltip
          .style("display", "block")
          .html(
            `<strong>${escapeHtml(
              d.id
            )}</strong><div class='text-xs mt-1'>${escapeHtml(d.type)}</div>`
          );
      })
      .on("click", function (event, d) {
        // if this is a publication node, navigate to the paper details
        if (d.type === "publication") {
          try {
            const paper = data.find((p) => p.title === d.id);
            const encoded = encodeURIComponent(d.id);
            if (paper) navigate(`/paper/${encoded}`, { state: { paper } });
            else navigate(`/paper/${encoded}`);
          } catch (err) {
            console.debug("navigate failed", err);
          }
        }
      })
      .on("mousemove", function (event) {
        // position tooltip using d3 pointer relative to container (avoid clipping)
        const [x, y] = d3.pointer(event, container);
        const left = Math.max(8, x + 12);
        const top = Math.max(8, y + 12);
        tooltip.style("left", `${left}px`).style("top", `${top}px`);
      })
      .on("mouseleave", function (event, d) {
        d3.select(this)
          .select("circle")
          .attr("stroke", "#fff")
          .attr("stroke-width", 1.5);
        d3.select(this)
          .select("text.node-label")
          .text(
            d.type === "publication"
              ? d.id.length > 60
                ? d.id.slice(0, 60) + "..."
                : d.id
              : ""
          );
        tooltip.style("display", "none");
      });

    // labels are shown for publication nodes by default (handled above); keep a secondary labels group in case
    const label = g
      .append("g")
      .attr("class", "labels")
      .selectAll("text")
      .data(nodes)
      .enter()
      .append("text")
      .attr("font-size", 9)
      .attr("fill", "#374151")
      .attr("dx", 0)
      .attr("dy", ".35em")
      .style("display", "none");

    const simulation = d3
      .forceSimulation(nodes)
      .force(
        "link",
        d3
          .forceLink(edges)
          .id((d) => d.id)
          .distance(100)
      )
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force(
        "collide",
        d3.forceCollide().radius((d) => (d.type === "publication" ? 18 : 12))
      );

    simulation.on("tick", () => {
      link
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);

      node.attr("transform", (d) => `translate(${d.x},${d.y})`);
      label.attr("x", (d) => d.x).attr("y", (d) => d.y);
    });

    // zoom / pan
    const zoom = d3
      .zoom()
      .scaleExtent([0.2, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom).call(zoom.transform, d3.zoomIdentity);

    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    // legend overlay (match modal colors)
    const legend = d3
      .select(container)
      .append("div")
      .attr("class", "kg-legend")
      .style("position", "absolute")
      .style("right", "12px")
      .style("top", "12px")
      .style("background", "rgba(255,255,255,0.95)")
      .style("padding", "8px 10px")
      .style("border-radius", "8px")
      .style("box-shadow", "0 1px 4px rgba(0,0,0,0.08)")
      .style("font-size", "12px").html(`
        <div style='display:flex;gap:8px;align-items:center;'><div style='width:12px;height:12px;background:#2563eb;border-radius:3px'></div><div>Publication</div></div>
        <div style='display:flex;gap:8px;align-items:center;margin-top:6px;'><div style='width:12px;height:12px;background:#0369a1;border-radius:3px'></div><div>Section</div></div>
        <div style='display:flex;gap:8px;align-items:center;margin-top:6px;'><div style='width:12px;height:12px;background:#10b981;border-radius:3px'></div><div>Keyword</div></div>
      `);

    // keep SVG sized to container
    const ro = new ResizeObserver(() => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      svg.attr("width", w).attr("height", h);
      simulation.force("center", d3.forceCenter(w / 2, h / 2));
      simulation.alpha(0.3).restart();
    });
    ro.observe(container);

    return () => {
      ro.disconnect();
      simulation.stop();
      tooltip.remove();
      legend.remove();
    };
  }, [navigate]);

  return (
    <div ref={containerRef} className="w-full h-full relative">
      <svg
        ref={svgRef}
        className="w-full h-full block touch-pan-y:touch-action-none"
      ></svg>
      {/* tooltip and legend are appended to container via d3 for simplicity */}
      <style>{`\n        .kg-tooltip { z-index: 50 }\n        .kg-legend { z-index: 40 }\n      `}</style>
    </div>
  );
}

// small helper to avoid injecting raw HTML from data
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
