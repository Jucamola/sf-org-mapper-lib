/*
 * Copyright (c) 2025, Juan Carlos Montero Lamata.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as fs from 'node:fs';
import createGraph, { Graph } from 'ngraph.graph';
import gexf from 'ngraph.gexf';
import { OrgMetadata, OrgMetadataTypeNames, OrgMetadataTypes } from '../types/sObjects';

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
    const { Label, ...nodeAttributes } = cleanNode(nodeMetadata as OrgMetadataTypes);
    ngraphGraph.addNode(nodeId, {
      label: cleanGexf(Label),
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

function cleanNode(nodeMetadata: OrgMetadataTypes): OrgMetadataTypes {
  const cleanNodeMetadata = Object.keys(nodeMetadata).map((key) => {
    if (typeof nodeMetadata[key as keyof OrgMetadataTypes] === 'string') {
      return [key as keyof OrgMetadataTypes, cleanGexf(nodeMetadata[key as keyof OrgMetadataTypes] as string)];
    }
    return [key as keyof OrgMetadataTypes, nodeMetadata[key as keyof OrgMetadataTypes]];
  });
  return Object.fromEntries(cleanNodeMetadata) as OrgMetadataTypes;
}

function cleanGexf(gexfString: string): string {
  let cleanedString = gexfString.replace(/&/g, '&amp;');
  cleanedString = cleanedString.replace(/</g, '&lt;');
  cleanedString = cleanedString.replace(/>/g, '&gt;');
  cleanedString = cleanedString.replace(/"/g, '&quot;');
  cleanedString = cleanedString.replace(/'/g, '&apos;');
  return cleanedString;
}
