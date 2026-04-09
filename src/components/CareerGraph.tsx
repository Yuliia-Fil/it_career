import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  Edge, 
  Node, 
  ConnectionLineType,
  MarkerType,
  useNodesState,
  useEdgesState,
  Position as FlowPosition,
  useReactFlow,
  ReactFlowProvider,
  useNodesInitialized
} from 'reactflow';
import 'reactflow/dist/style.css';
import { CareerNode } from './CareerNode';
import { Position, Employee, MOCK_POSITIONS } from '@/src/types';
import dagre from 'dagre';

const nodeTypes = {
  careerNode: CareerNode,
};

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

// Standard dimensions as fallback
const nodeWidth = 330;
const nodeHeight = 150;

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  dagreGraph.setGraph({ rankdir: direction, ranksep: 120, nodesep: 150 });

  nodes.forEach((node) => {
    const width = node.width ?? nodeWidth;
    const height = node.height ?? nodeHeight;
    dagreGraph.setNode(node.id, { width, height });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const width = node.width ?? nodeWidth;
    const height = node.height ?? nodeHeight;

    return {
      ...node,
      targetPosition: FlowPosition.Top,
      sourcePosition: FlowPosition.Bottom,
      position: {
        x: nodeWithPosition.x - width / 2,
        y: nodeWithPosition.y - height / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

interface CareerGraphProps {
  employee: Employee;
  onNodeClick: (position: Position) => void;
}

const GraphInner = ({ employee, onNodeClick }: CareerGraphProps) => {
  const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(new Set());
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { fitView } = useReactFlow();
  
  const [needsLayout, setNeedsLayout] = useState(true);
  const nodesInitialized = useNodesInitialized({ includeHiddenNodes: false });

  const calculateMatch = useCallback((pos: Position) => {
    const totalReqs = pos.requirements.length;
    const metReqs = pos.requirements.filter(req => {
      const userSkill = employee.skills.find(s => s.id === req.skillId);
      return (userSkill?.level || 0) >= req.minLevel;
    }).length;
    return Math.round((metReqs / totalReqs) * 100);
  }, [employee.skills]);

  const toggleCollapse = useCallback((nodeId: string) => {
    setCollapsedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return next;
    });
    setNeedsLayout(true);
  }, []);

  useEffect(() => {
    const rawNodes: Node[] = [];
    const rawEdges: Edge[] = [];

    const rootNode: Node = {
      id: 'root',
      type: 'careerNode',
      data: { 
        title: 'IT Департамент', 
        isHeader: true,
        hasChildren: true,
        isCollapsed: collapsedNodes.has('root'),
        onToggleCollapse: () => toggleCollapse('root')
      },
      position: { x: 0, y: 0 },
      draggable: true,
      style: { opacity: 0 }, // invisible but measured
    };
    rawNodes.push(rootNode);

    if (!collapsedNodes.has('root')) {
      const dynamicEdges: Edge[] = MOCK_POSITIONS.map(pos => {
        if (pos.parentId) {
          return {
            id: `e-${pos.parentId}-${pos.id}`,
            source: pos.parentId,
            target: pos.id,
            markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--color-outline-variant)' },
            animated: true,
            style: { stroke: 'var(--color-outline-variant)', strokeWidth: 2 }
          };
        }
        return {
          id: `e-root-${pos.id}`,
          source: 'root',
          target: pos.id,
          animated: true,
          markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--color-outline-variant)' },
          style: { stroke: 'var(--color-outline-variant)', strokeWidth: 2 }
        };
      });

      MOCK_POSITIONS.forEach(pos => {
        let currentParent = pos.parentId || 'root';
        let hiddenByAncestor = false;
        while (currentParent) {
          if (collapsedNodes.has(currentParent)) {
            hiddenByAncestor = true;
            break;
          }
          const parentPos = MOCK_POSITIONS.find(p => p.id === currentParent);
          currentParent = parentPos?.parentId || (currentParent === 'root' ? null : 'root');
        }

        if (!hiddenByAncestor) {
          rawNodes.push({
            id: pos.id,
            type: 'careerNode',
            data: { 
              title: pos.title, 
              isCurrent: employee.currentPositionId === pos.id,
              isVacant: pos.isVacant,
              isGoal: employee.goals.includes(pos.id),
              matchPercentage: calculateMatch(pos),
              employeeCount: pos.employeeCount,
              position: pos,
              hasChildren: MOCK_POSITIONS.some(p => p.parentId === pos.id),
              isCollapsed: collapsedNodes.has(pos.id),
              onToggleCollapse: () => toggleCollapse(pos.id)
            },
            position: { x: 0, y: 0 },
            draggable: true,
            style: { opacity: 0 },
          });
        }
      });

      dynamicEdges.forEach(edge => {
        const sourceVisible = rawNodes.some(n => n.id === edge.source);
        const targetVisible = rawNodes.some(n => n.id === edge.target);
        if (sourceVisible && targetVisible) {
          rawEdges.push(edge);
        }
      });
    }

    setNodes(rawNodes);
    setEdges(rawEdges);
    setNeedsLayout(true);
  }, [collapsedNodes, employee, toggleCollapse, calculateMatch, setNodes, setEdges]);

  useEffect(() => {
    if (nodesInitialized && needsLayout && nodes.length > 0) {
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
        nodes,
        edges
      );
      
      const visibleNodes = layoutedNodes.map(n => ({...n, style: { opacity: 1, transition: 'opacity 0.2s' }}));
      
      setNodes(visibleNodes);
      setEdges(layoutedEdges);
      setNeedsLayout(false);
      
      window.requestAnimationFrame(() => {
        fitView({ padding: 0.2, duration: 800 });
      });
    }
  }, [nodesInitialized, needsLayout, nodes, edges, setNodes, setEdges, fitView]);

  const onNodeClickHandler = useCallback((event: React.MouseEvent, node: Node) => {
    if (node.data.position) {
      onNodeClick(node.data.position);
    }
  }, [onNodeClick]);

  return (
    <div className="w-full h-full bg-background">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClickHandler}
        nodeTypes={nodeTypes}
        connectionLineType={ConnectionLineType.SmoothStep}
        fitView
        className="career-flow"
      >
        <Background color="var(--color-outline-variant)" gap={20} />
        <Controls />
      </ReactFlow>
    </div>
  );
};

export const CareerGraph = (props: CareerGraphProps) => {
  return (
    <ReactFlowProvider>
      <GraphInner {...props} />
    </ReactFlowProvider>
  );
};
