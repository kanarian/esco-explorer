import { useEffect, useRef, useState } from "react";
import ForceGraph, { ForceGraphMethods, GraphData } from "react-force-graph-2d";
import { ISCO } from "~/app/data/isco";
import { OCCUPATIONS } from "~/app/data/occ";
import { RELATIONS } from "~/app/data/relations";

interface EscoOccupationGraphProps {
  currentSelectedNode: string | null;
  setCurrentSelectedNode: (nodeId: string | null) => void;
}

const nodeMaker = () => {
  const occNodes = OCCUPATIONS.map((el) => {
    return {
      id: el.conceptUri,
      name: el.preferredLabel,
      conceptType: "occupation",
      code: el.code,
    };
  });

  const iscoGroups = ISCO.map((el) => {
    return {
      id: el.conceptUri,
      name: el.preferredLabel,
      conceptType: "iscoGroup",
      code: el.code,
    };
  });
  return [...occNodes, ...iscoGroups];
};

const linksMaker = () => {
  const links = RELATIONS.map((el) => {
    return {
      source: el.broaderUri,
      target: el.conceptUri,
    };
  });
  return links;
};

const graphData = {
  nodes: nodeMaker(),
  links: linksMaker(),
};

export default function EscoOccupationGraph({
  currentSelectedNode,
  setCurrentSelectedNode,
}: EscoOccupationGraphProps) {
  const fgRef = useRef<ForceGraphMethods | undefined>();
  const [currentGraphData, setCurrentGraphData] =
    useState<GraphData>(graphData);
  const [shownGraphData, setShownGraphData] = useState<GraphData>(graphData);

  useEffect(() => {
    if (currentSelectedNode) {
      const filteredGraphData = getAllDescendants(currentSelectedNode);
      setShownGraphData(filteredGraphData);
      if (fgRef.current) {
        fgRef.current.centerAt(0, 0, 1000);
      }
    } else {
      setShownGraphData(graphData);
    }
  }, [currentSelectedNode]);

  const getAllDescendants = (nodeId: string) => {
    const allDescendants: string[] = [];
    const queue = [nodeId];

    while (queue.length > 0) {
      const currentNodeId = queue.shift();
      if (!currentNodeId) {
        break;
      }
      allDescendants.push(currentNodeId);

      // Find all outgoing links from the current node
      const outgoingLinks = currentGraphData.links.filter(
        (link) =>
          (typeof link.source === "object" ? link.source.id : link.source) ===
          currentNodeId,
      );

      // Add target nodes of outgoing links to the queue
      outgoingLinks.forEach((link) => {
        const targetNodeId = (
          typeof link.target === "object" && link.target
            ? link.target.id
            : link.target
        )?.toString();
        if (targetNodeId && !allDescendants.includes(targetNodeId)) {
          queue.push(targetNodeId);
        }
      });
    }

    // Filter nodes and links based on descendants
    const filteredNodes = currentGraphData.nodes.filter(
      (node) =>
        allDescendants.includes(node.id as string) || node.id === nodeId,
    );
    const filteredLinks = currentGraphData.links.filter((link) => {
      const filteredNodeIds = filteredNodes.map((node) => node.id as string);
      const sourceId =
        typeof link.source === "object" && link.source
          ? link.source.id
          : link.source;
      const targetId =
        typeof link.target === "object" && link.target
          ? link.target.id
          : link.target;
      return (
        filteredNodeIds.includes(sourceId as string) &&
        filteredNodeIds.includes(targetId as string)
      );
    });

    return { nodes: filteredNodes, links: filteredLinks };
  };

  // const getAllAncestors = (nodeId: string) => {
  //     const allAncestors: string[] = [];
  //     const queue = [nodeId];

  //     while (queue.length > 0) {
  //         const currentNodeId = queue.shift();
  //         allAncestors.push(currentNodeId);

  //         // Find all incoming links to the current node
  //         const incomingLinks = currentGraphData.links.filter(
  //             (link) => link.target.id === currentNodeId
  //         );

  //         // Add source nodes of incoming links to the queue
  //         incomingLinks.forEach((link) => {
  //             const sourceNodeId = link.source.id;
  //             if (!allAncestors.includes(sourceNodeId)) {
  //                 queue.push(sourceNodeId);
  //             }
  //         });
  //     }

  //     // Filter nodes and links based on ancestors
  //     const filteredNodes = currentGraphData.nodes.filter(
  //         (node) => allAncestors.includes(node.id) || node.id === nodeId
  //     );
  //     const filteredLinks = currentGraphData.links.filter((link) => {
  //         const filteredNodeIds = filteredNodes.map((node) => node.id);
  //         return (
  //             filteredNodeIds.includes(link.source.id) &&
  //             filteredNodeIds.includes(link.target.id)
  //         );
  //     });

  //     return { nodes: filteredNodes, links: filteredLinks };
  // };
  const occupationOptions = OCCUPATIONS.map((el) => {
    return {
      label: el.preferredLabel + " - " + el.code,
      value: el.conceptUri,
    };
  });
  const iscoOptions = ISCO.map((el) => {
    return {
      label: el.preferredLabel + " - " + el.code,
      value: el.conceptUri,
    };
  });

  const allNodeOptions = [...occupationOptions, ...iscoOptions].sort((a, b) =>
    a.label.localeCompare(b.label),
  );
  return (
    <div className="flex h-full w-full items-center justify-center bg-slate-100">
      <ForceGraph
        ref={fgRef}
        graphData={shownGraphData}
        // nodeCanvasObject={(node, ctx, globalScale) => {
        //     const label = node.code + " " + node.name;
        //     const fontSize = 12 / globalScale;
        //     ctx.font = `${fontSize}px Sans-Serif`;
        //     ctx.fillStyle = "black";
        //     const textWidth = ctx.measureText(label).width;
        //     const bckgDimensions = [textWidth, fontSize].map(
        //         (n) => n + fontSize * 0.2
        //     ); // some padding
        //     ctx.fillRect(
        //         node.x - bckgDimensions[0] / 2,
        //         node.y - bckgDimensions[1] / 2,
        //         ...bckgDimensions
        //     );

        //     let newColor =
        //         node.conceptType === "occupation" ? "blue" : "green";

        //     ctx.textAlign = "center";
        //     ctx.textBaseline = "middle";
        //     ctx.fillStyle = newColor;
        //     ctx.fillText(label, node.x, node.y);

        //     node.__bckgDimensions = bckgDimensions; // to re-use in nodePointerAreaPaint
        // }}
        dagMode="td"
        // nodePointerAreaPaint={(node, color, ctx) => {
        //     ctx.fillStyle = color;
        //     const bckgDimensions = node.__bckgDimensions;
        //     bckgDimensions &&
        //         ctx.fillRect(
        //             node.x - bckgDimensions[0] / 2,
        //             node.y - bckgDimensions[1] / 2,
        //             ...bckgDimensions
        //         );
        // }}
        onNodeClick={(node) => {
          if (currentSelectedNode === node.id) {
            setCurrentSelectedNode(null);
            setShownGraphData(graphData);
            return;
          }
          setCurrentSelectedNode(node.id as string);
        }}
        nodeAutoColorBy={"conceptType"}
        dagLevelDistance={100}
        nodeLabel={(el) => {
          return `${el.code} - ${el.name}`;
        }}
      />
    </div>
  );
}
