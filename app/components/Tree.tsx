// @ts-nocheck
"use client"
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const Tree = () => {
  const svgRef = useRef(null);
  const [treeData, setTreeData] = useState(null);

  useEffect(() => {
    const storedData = localStorage.getItem("dataJSON");
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        setTreeData(parsedData);
      } catch (error) {
        console.error("Error parsing JSON data:", error);
      }
    }
  }, []);

  useEffect(() => {
    if (!treeData || !svgRef.current) return;

    const width = 1920;
    const height = 1080;
    const marginTop = 10;
    const marginRight = 10;
    const marginBottom = 10;
    const marginLeft = 40;

    const isArray = d => Array.isArray(d) && d.length > 0;

    let objectCounter = 0;
    let arrayCounter = 0;

    const processTreeData = data => {
      const processNode = (node, depth = 0) => {
        if (typeof node === 'object' && !isArray(node)) {
          objectCounter++;
          return {
            name: Object.keys(node).length ? `Object #${objectCounter}` : `Empty Object #${objectCounter}`,
            children: Object.keys(node).map(key => ({
              name: key,
              children: isArray(node[key]) ? node[key].map(child => processNode(child, depth + 1)) : [processNode(node[key], depth + 1)]
            })),
            _children: depth > 0 ? Object.keys(node).map(key => ({
              name: key,
              children: isArray(node[key]) ? node[key].map(child => processNode(child, depth + 1)) : [processNode(node[key], depth + 1)]
            })) : null
          };
        } else if (isArray(node)) {
          arrayCounter++;
          return {
            name: `Array #${arrayCounter}`,
            children: node.map(item => processNode(item, depth + 1)),
            _children: depth > 0 ? node.map(item => processNode(item, depth + 1)) : null
          };
        } else {
          return { name: node.toString() };
        }
      };

      return processNode(data);
    };

    const root = d3.hierarchy(processTreeData(treeData));
    const dx = 34;
    const dy = 120;

    const tree = d3.tree().nodeSize([dx, dy]);
    const diagonal = d3.linkHorizontal().x(d => d.y).y(d => d.x);

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif; user-select: none;");

    svg.selectAll("*").remove(); // Clear previous content

    // Create a group element for zooming
    const g = svg.append("g");

    // Add zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);

    // Center the tree initially
    const initialTransform = d3.zoomIdentity
      .translate(width / 2, height / 2)
      .scale(0.8);
    svg.call(zoom.transform, initialTransform);

    const gLink = g.append("g")
      .attr("fill", "none")
      .attr("stroke", "#559747")
      .attr("stroke-opacity", 0.4)
      .attr("stroke-width", 1.5);

    const gNode = g.append("g")
      .attr("cursor", "pointer")
      .attr("pointer-events", "all");

    root.x0 = 0;
    root.y0 = 0;
    root.descendants().forEach((d, i) => {
      d.id = i;
      d._children = d.children;
      if (d.depth > 0) d.children = null;
    });

    const update = (source) => {
      const nodes = root.descendants().reverse();
      const links = root.links();

      tree(root);

      const transition = svg.transition()
        .duration(250);

      const node = gNode.selectAll("g")
        .data(nodes, d => d.id);

      const nodeEnter = node.enter().append("g")
        .attr("transform", d => `translate(${source.y0},${source.x0})`)
        .attr("fill-opacity", 0)
        .attr("stroke-opacity", 0)
        .on("click", (event, d) => {
          d.children = d.children ? null : d._children;
          update(d);
        });

      nodeEnter.append("rect")
        .attr("width", 100)
        .attr("height", 20)
        .attr("x", -50)
        .attr("y", -10)
        .attr("fill", "#fff")
        .attr("stroke", "#559747")
        .attr("stroke-width", 1.5);

      nodeEnter.append("text")
        .attr("dy", "0.31em")
        .attr("x", 0)
        .attr("text-anchor", "middle")
        .text(d => d.data.name)
        .clone(true).lower()
        .attr("stroke-linejoin", "round")
        .attr("stroke-width", 3)
        .attr("stroke", "white");

      node.merge(nodeEnter).transition(transition)
        .attr("transform", d => `translate(${d.y},${d.x})`)
        .attr("fill-opacity", 1)
        .attr("stroke-opacity", 1);

      node.exit().transition(transition).remove()
        .attr("transform", d => `translate(${source.y},${source.x})`)
        .attr("fill-opacity", 0)
        .attr("stroke-opacity", 0);

      const link = gLink.selectAll("path")
        .data(links, d => d.target.id);

      const linkEnter = link.enter().append("path")
        .attr("d", d => {
          const o = { x: source.x0, y: source.y0 };
          return diagonal({ source: o, target: o });
        });

      link.merge(linkEnter).transition(transition)
        .attr("d", diagonal);

      link.exit().transition(transition).remove()
        .attr("d", d => {
          const o = { x: source.x, y: source.y };
          return diagonal({ source: o, target: o });
        });

      root.eachBefore(d => {
        d.x0 = d.x;
        d.y0 = d.y;
      });
    };

    update(root);
  }, [treeData]);

  return <div className="border-2 border-black"><svg ref={svgRef}></svg></div>;
};

export default Tree;