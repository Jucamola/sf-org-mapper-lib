/*
 * Copyright (c) 2025, Juan Carlos Montero Lamata.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import cytoscape from 'cytoscape';
import { NodeReference } from '../types/sObjects';

function findNode(graph: cytoscape.Core, nodeRef: NodeReference): cytoscape.NodeCollection {
  const node =
    typeof nodeRef === 'string'
      ? graph.getElementById(nodeRef)
      : graph.nodes(`node[Label = '${nodeRef.Label}'][Type = '${nodeRef.Type}']`);

  if (node.empty()) {
    const nodeRefString = typeof nodeRef === 'string' ? nodeRef : JSON.stringify(nodeRef);
    throw new Error(`Node with id ${nodeRefString} not found`);
  }
  return node;
}

function buildPartialGraph(
  graph: cytoscape.Core,
  nodeRef: NodeReference,
  getRelatedNodes: (node: cytoscape.NodeCollection) => cytoscape.CollectionReturnValue
): cytoscape.CollectionReturnValue {
  const node = findNode(graph, nodeRef);
  return node.union(getRelatedNodes(node));
}

export function buildDependenciesGraph(graph: cytoscape.Core, nodeRef: NodeReference): cytoscape.CollectionReturnValue {
  return buildPartialGraph(graph, nodeRef, (node) => node.successors());
}

export function buildUsesGraph(graph: cytoscape.Core, nodeRef: NodeReference): cytoscape.CollectionReturnValue {
  return buildPartialGraph(graph, nodeRef, (node) => node.predecessors());
}

function buildMultipleGraphs(
  graph: cytoscape.Core,
  nodeRefs: NodeReference[],
  buildSingleGraph: (graph: cytoscape.Core, nodeRef: NodeReference) => cytoscape.CollectionReturnValue,
  merge: boolean = false
): cytoscape.CollectionReturnValue[] {
  const graphs = nodeRefs.map((nodeRef) => buildSingleGraph(graph, nodeRef));
  if (merge) {
    return [graphs.reduce((acc, curr) => acc.union(curr))];
  } else {
    return graphs;
  }
}

export function buildDependenciesGraphs(
  graph: cytoscape.Core,
  nodeRefs: NodeReference[],
  merge: boolean = false
): cytoscape.CollectionReturnValue[] {
  return buildMultipleGraphs(graph, nodeRefs, buildDependenciesGraph, merge);
}

export function buildUsesGraphs(
  graph: cytoscape.Core,
  nodeRefs: NodeReference[],
  merge: boolean = false
): cytoscape.CollectionReturnValue[] {
  return buildMultipleGraphs(graph, nodeRefs, buildUsesGraph, merge);
}

export function buildDependenciesGraphWithoutRedundancy(
  graph: cytoscape.Core,
  nodeRef: NodeReference
): cytoscape.CollectionReturnValue {
  return buildPartialGraph(graph, nodeRef, successorsWithoutRedundancy);
}

function successorsWithoutRedundancy(startNodeCollection: cytoscape.NodeCollection): cytoscape.CollectionReturnValue {
  return buildPartialGraphWithoutRedundancy(
    startNodeCollection,
    (node) => node.outgoers('edge'),
    (edge) => edge.target()
  );
}

export function buildUsesGraphWithoutRedundancy(
  graph: cytoscape.Core,
  nodeRef: NodeReference
): cytoscape.CollectionReturnValue {
  return buildPartialGraph(graph, nodeRef, predecessorsWithoutRedundancy);
}

function predecessorsWithoutRedundancy(startNodeCollection: cytoscape.NodeCollection): cytoscape.CollectionReturnValue {
  return buildPartialGraphWithoutRedundancy(
    startNodeCollection,
    (node) => node.incomers('edge'),
    (edge) => edge.source()
  );
}

function buildPartialGraphWithoutRedundancy(
  startNodeCollection: cytoscape.NodeCollection,
  getRelatedNodes: (node: cytoscape.NodeCollection) => cytoscape.CollectionReturnValue,
  getConnectedNode: (edge: cytoscape.EdgeSingular) => cytoscape.NodeSingular
): cytoscape.CollectionReturnValue {
  const startNode: cytoscape.NodeSingular = startNodeCollection[0];
  const visitedNodes: Set<string> = new Set<string>();
  const relatedNodes: cytoscape.NodeSingular[] = [];
  const relatedEdges: cytoscape.EdgeSingular[] = [];

  function traverse(node: cytoscape.NodeSingular): void {
    if (visitedNodes.has(node.id())) {
      return;
    }

    visitedNodes.add(node.id());
    relatedNodes.push(node);

    getRelatedNodes(node).forEach((edge) => {
      const connectedNode: cytoscape.NodeSingular = getConnectedNode(edge);
      if (!visitedNodes.has(connectedNode.id())) {
        relatedEdges.push(edge);
        traverse(connectedNode);
      }
    });
  }

  traverse(startNode);
  relatedNodes.shift();
  const allElements = ([] as Array<cytoscape.NodeSingular | cytoscape.EdgeSingular>).concat(relatedNodes, relatedEdges);
  return cytoscape().collection(allElements);
}
