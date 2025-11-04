'use client';

import { SurveyElementDto } from "@/dtos/SurveysElementsDto";


export const ensureNodeFunctions = (nodeList: any[], handleNodeDelete: (nodeId: string) => void, handleNodeDoubleClick: (nodeId: string) => void) => {
  return nodeList.map((node: any) => ({
    ...node,
    data: {
      ...node.data,
      onDelete: () => handleNodeDelete(node.id),
      onDoubleClick: () => handleNodeDoubleClick(node.id)
    }
  }));
};

export const createNewNode = (
  id: string,
  position: { x: number; y: number },
  label: string,
  type: 'mensagem' | 'alternativa' | 'input' | 'fim' = 'mensagem',
  maxEdges: number = 2,
  handleNodeDelete: (nodeId: string) => void,
  handleNodeDoubleClick: (nodeId: string) => void
) => ({
  id,
  type: 'customNode',
  position,
  data: {
    label,
    type,
    maxEdges,
    onClick: () => console.log('Clique no novo nó'),
    onDoubleClick: () => handleNodeDoubleClick(id),
    onDelete: () => handleNodeDelete(id)
  }
});

export const createAlternativeNodes = (
  parentNodeId: string,
  parentPosition: { x: number; y: number },
  alternatives: string[],
  handleNodeDelete: (nodeId: string) => void,
  handleNodeDoubleClick: (nodeId: string) => void
) => {
  return alternatives
    .filter(alt => alt.trim() !== '')
    .map((alternativa, index) => ({
      id: `${parentNodeId}-alt-${index}`,
      type: 'customNode',
      position: {
        x: parentPosition.x + (index * 200),
        y: parentPosition.y + 150
      },
      data: {
        label: alternativa,
        type: 'alternativa' as const,
        maxEdges: 1,
        onClick: () => console.log('Clique na alternativa:', alternativa),
        onDoubleClick: () => handleNodeDoubleClick(`${parentNodeId}-alt-${index}`),
        onDelete: () => handleNodeDelete(`${parentNodeId}-alt-${index}`)
      }
    }));
};

export const createAlternativeEdges = (parentNodeId: string, alternativeNodes: any[]) => {
  return alternativeNodes.map((node: any) => ({
    id: `${parentNodeId}-to-${node.id}`,
    source: parentNodeId,
    target: node.id
  }));
};

export const createInputNode = (
  parentNodeId: string,
  parentPosition: { x: number; y: number },
  handleNodeDelete: (nodeId: string) => void,
  handleNodeDoubleClick: (nodeId: string) => void
) => {
  const inputNodeId = `${parentNodeId}-input`;
  return {
    node: {
      id: inputNodeId,
      type: 'customNode',
      position: {
        x: parentPosition.x,
        y: parentPosition.y + 150
      },
      data: {
        label: 'Campo de entrada',
        type: 'input' as const,
        maxEdges: 1,
        onClick: () => console.log('Clique no input'),
        onDoubleClick: () => handleNodeDoubleClick(inputNodeId),
        onDelete: () => handleNodeDelete(inputNodeId)
      }
    },
    edge: {
      id: `${parentNodeId}-to-input`,
      source: parentNodeId,
      target: inputNodeId
    }
  };
};

export const handleInsertOnCanvaAtPosition = (
  element: SurveyElementDto,
  position: { x: number, y: number },
  setNodes: (nodes: any) => void,
  setEdges: (edges: any) => void,
  nodes: any[],
  edges: any[],
  saveToLocalStorage: (nodes: any[], edges: any[]) => void,
  handleNodeDelete: (nodeId: string) => void,
  handleNodeDoubleClick: (nodeId: string) => void
) => {
  console.log('Inserindo elemento na posição:', position);

  const newNodeId = `node-${Date.now()}`;

  const newNode = createNewNode(
    newNodeId,
    position,
    element.description,
    'mensagem',
    element.options?.length > 0 ? element.options.length : 2,
    handleNodeDelete,
    handleNodeDoubleClick
  );

  const newNodes = [newNode];
  const newEdges: any[] = [];

  if (element.options && element.options.length > 0) {
    element.options.forEach((option: any, index: number) => {
      const childNodeId = `${newNodeId}-child-${index}`;
      const childNode = createNewNode(
        childNodeId,
        {
          x: position.x + (index * 200),
          y: position.y + 150
        },
        option.description,
        'alternativa',
        1,
        handleNodeDelete,
        handleNodeDoubleClick
      );

      const edge = {
        id: `${newNodeId}-to-${childNodeId}`,
        source: newNodeId,
        target: childNodeId
      };

      newNodes.push(childNode);
      newEdges.push(edge);
    });
  }

  setNodes((prevNodes: any) => [...prevNodes, ...newNodes]);
  setEdges((prevEdges: any) => [...prevEdges, ...newEdges]);

  saveToLocalStorage([...nodes, ...newNodes], [...edges, ...newEdges]);

  console.log('✅ Elemento inserido no canvas na posição:', {
    position,
    mainNode: newNode,
    childNodes: newNodes.slice(1),
    edges: newEdges
  });
};
