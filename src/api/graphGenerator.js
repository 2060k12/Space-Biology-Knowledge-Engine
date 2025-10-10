export function generateGraphData(publications) {
  const nodes = new Map();
  const edges = [];

  publications.forEach((pub) => {
    // Add publication node
    nodes.set(pub.title, { id: pub.title, type: "publication" });

    // Each section (abstract, intro, results, conclusion)
    const sections = [
      { key: "abstract", label: "Abstract" },
      { key: "introduction", label: "Introduction" },
      { key: "results", label: "Results" },
      { key: "conclusion", label: "Conclusion" },
    ];

    // Add nodes for each available section
    sections.forEach(({ key, label }) => {
      if (pub[key] && pub[key].trim().length > 0) {
        const nodeId = `${pub.title} - ${label}`;
        nodes.set(nodeId, { id: nodeId, type: "section" });
        edges.push({ source: pub.title, target: nodeId });
      }
    });

    // Add keyword nodes (if exist)
    if (pub.keywords && pub.keywords.trim().length > 0) {
      const keywords = pub.keywords.split(",").map((k) => k.trim());
      keywords.forEach((keyword) => {
        if (!nodes.has(keyword)) {
          nodes.set(keyword, { id: keyword, type: "keyword" });
        }
        edges.push({ source: pub.title, target: keyword });
      });
    }
  });

  return {
    nodes: Array.from(nodes.values()),
    edges,
  };
}
