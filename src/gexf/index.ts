/*
 * Copyright (c) 2025, Juan Carlos Montero Lamata.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as fs from 'node:fs';
import createGraph, { Graph } from 'ngraph.graph';
import gexf from 'ngraph.gexf';
import { OrgMetadata, OrgMetadataTypeNames } from '../types/SObjects';

export function writeGexf(
  cytoscapeCollection: cytoscape.CollectionReturnValue,
  fileName: string,
  orgMetadata: OrgMetadata
): void {
  const ngraphGraph = buildGraph(cytoscapeCollection, orgMetadata);
  const gexfFile = gexf.save(ngraphGraph);
  fs.writeFileSync(fileName + '.gexf', gexfFile);
}

function buildGraph(cytoscapeCollection: cytoscape.CollectionReturnValue, orgMetadata: OrgMetadata): Graph {
  const ngraphGraph = createGraph();

  cytoscapeCollection.nodes().forEach((cyNode) => {
    const nodeId = cyNode.id();
    const type = cyNode.attr('Type') as OrgMetadataTypeNames;
    const nodeMetadata = orgMetadata.get(type)?.get(nodeId) ?? { Label: nodeId, Type: type };
    const { Label, ...nodeAttributes } = nodeMetadata;
    ngraphGraph.addNode(nodeId, {
      label: Label,
      ...nodeAttributes,
    });
  });

  cytoscapeCollection.edges().forEach((cyEdge) => {
    const sourceNodeId = cyEdge.source().id();
    const targetNodeId = cyEdge.target().id();
    ngraphGraph.addLink(sourceNodeId, targetNodeId);
  });

  return ngraphGraph;
}
