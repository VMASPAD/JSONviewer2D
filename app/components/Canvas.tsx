// @ts-nocheck
import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

const ForceDirectedGraph = ({ onNodeClick }) => {
  const svgRef = useRef(null);
  const [graphData, setGraphData] = useState(null);
  const [nodeDataMap, setNodeDataMap] = useState(new Map());

  useEffect(() => {
    const storedData = localStorage.getItem("dataJSON");
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        const { processedData, dataMap } = processJSONData(parsedData);
        setGraphData(processedData);
        setNodeDataMap(dataMap);
      } catch (error) {
        console.error("Error parsing JSON data:", error);
      }
    }
  }, []);

  useEffect(() => {
    if (!graphData || !graphData.links || !graphData.nodes) {
      console.error('Los datos de enlaces y nodos son requeridos');
      return;
    }

    const width = 1920;
    const height = 720;

    const links = graphData.links.map(d => ({ ...d }));
    const nodes = graphData.nodes.map(d => ({ ...d }));

    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(200))
      .force('charge', d3.forceManyBody().strength(-100))
      .force('collide', d3.forceCollide().radius(30))
      .force('center', d3.forceCenter(width / 2, height / 2));

    const svg = d3.select(svgRef.current)
      .html("")  // Clear existing content
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height])
      .attr('style', 'max-width: 100%; height: auto;')
      .call(d3.zoom().on("zoom", (event) => {
        svg.attr("transform", event.transform);
      }))
      .append("g");

    const link = svg.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', d => Math.sqrt(d.value));

    const node = svg.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .call(drag(simulation));

    node.append('circle')
      .attr('r', 20)
      .attr('fill', d => d.type === 'array' ? '#4299e1' : '#48bb78')
      .on('click', (event, d) => {
        const fullData = nodeDataMap.get(d.id);
        onNodeClick(event, fullData);
      })
      .on('mouseover', function() {
        d3.select(this).attr('stroke', 'black').attr('stroke-width', 2);
      })
      .on('mouseout', function() {
        d3.select(this).attr('stroke', null);
      });

    node.append('text')
      .text(d => d.id)
      .attr('x', -15)
      .attr('y', 3)
      .attr('fill', 'white')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .style('font-size', '8px') // Cambiado a un tamaño más pequeño

    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    return () => {
      simulation.stop();
    };
  }, [graphData, onNodeClick, nodeDataMap]);

  const drag = (simulation) => {
    function dragstarted(event) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }
    
    function dragged(event) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }
    
    function dragended(event) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }
    
    return d3.drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended);
  };

  const processJSONData = (data) => {
    const nodes = [];
    const links = [];
    const dataMap = new Map();
    let nodeId = 0;

    function traverse(obj, parentId = null, path = '') {
      const currentId = nodeId++;
      const nodeType = Array.isArray(obj) ? 'array' : 'object';
      const nodeName = parentId === null ? 'root' : Object.keys(data).find(key => data[key] === obj) || `${nodeType}${currentId}`;
      const fullPath = path ? `${path}.${nodeName}` : nodeName;
      
      nodes.push({ id: nodeName, type: nodeType });
      dataMap.set(nodeName, { fullPath, data: obj });

      if (parentId !== null) {
        links.push({ source: parentId, target: nodeName, value: 1 });
      }

      if (typeof obj === 'object' && obj !== null) {
        Object.keys(obj).forEach(key => {
          if (typeof obj[key] === 'object' && obj[key] !== null) {
            const childId = traverse(obj[key], nodeName, fullPath);
            links.push({ source: nodeName, target: childId, value: 1 });
          }
        });
      }

      return nodeName;
    }

    traverse(data);

    return { processedData: { nodes, links }, dataMap };
  };

  return <div className="border-2 border-black" ref={svgRef} />;
};

export default ForceDirectedGraph;