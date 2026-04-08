import React, { useState, useCallback, useMemo, useEffect } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  Edge, 
  Node, 
  ConnectionLineType,
  MarkerType,
  useNodesState,
  useEdgesState,
  applyNodeChanges,
  applyEdgeChanges,
  NodeChange,
  EdgeChange
} from 'reactflow';
import 'reactflow/dist/style.css';
import { CareerNode } from './CareerNode';
import { Position, Employee, MOCK_POSITIONS } from '@/src/types';

const nodeTypes = {
  careerNode: CareerNode,
};

interface CareerGraphProps {
  employee: Employee;
  onNodeClick: (position: Position) => void;
}

export const CareerGraph = ({ employee, onNodeClick }: CareerGraphProps) => {
  const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(new Set());
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

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
  }, []);

  useEffect(() => {
    const visibleNodes: Node[] = [];
    const visibleEdges: Edge[] = [];

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
      position: { x: 400, y: -150 },
      draggable: true,
    };
    visibleNodes.push(rootNode);

    if (!collapsedNodes.has('root')) {
      const dynamicEdges: Edge[] = MOCK_POSITIONS.map(pos => {
        if (pos.parentId) {
          return {
            id: `e-${pos.parentId}-${pos.id}`,
            source: pos.parentId,
            target: pos.id,
            markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--color-outline-variant)' },
            style: { stroke: 'var(--color-outline-variant)', strokeWidth: 2 }
          };
        }
        return {
          id: `e-root-${pos.id}`,
          source: 'root',
          target: pos.id,
          animated: true,
          style: { stroke: 'var(--color-outline-variant)', strokeWidth: 2 }
        };
      });

      const getLevel = (id: string): number => {
        const pos = MOCK_POSITIONS.find(p => p.id === id);
        if (!pos || !pos.parentId) return 0;
        return 1 + getLevel(pos.parentId);
      };

      // Group positions by level to calculate X better
      const levels: Record<number, Position[]> = {};
      MOCK_POSITIONS.forEach(pos => {
        // Visibility check
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
          const level = getLevel(pos.id);
          if (!levels[level]) levels[level] = [];
          levels[level].push(pos);
        }
      });

      Object.entries(levels).forEach(([levelStr, posList]) => {
        const level = parseInt(levelStr);
        posList.forEach((pos, idx) => {
          visibleNodes.push({
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
            position: { 
              x: 400 + (idx - (posList.length - 1) / 2) * 350, 
              y: level * 250 
            },
            draggable: true,
          });
        });
      });

      dynamicEdges.forEach(edge => {
        const sourceVisible = visibleNodes.some(n => n.id === edge.source);
        const targetVisible = visibleNodes.some(n => n.id === edge.target);
        if (sourceVisible && targetVisible) {
          visibleEdges.push(edge);
        }
      });
    }

    setNodes(visibleNodes);
    setEdges(visibleEdges);
  }, [collapsedNodes, employee, toggleCollapse, calculateMatch, setNodes, setEdges]);

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
