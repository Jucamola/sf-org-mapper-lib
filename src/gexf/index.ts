/*
 * Copyright (c) 2025, Juan Carlos Montero Lamata.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as fs from 'node:fs';
import createGraph, { Graph } from 'ngraph.graph';
import gexf from 'ngraph.gexf';
import { OrgMetadata, OrgMetadataTypeNames, OrgMetadataTypes, Package2MembersMap } from '../types/sObjects';

export function writeGexf(
  cytoscapeCollection: cytoscape.CollectionReturnValue,
  fileName: string,
  orgMetadata: OrgMetadata,
  package2MembersMap?: Package2MembersMap,
  includeSubscriberPackage?: boolean
): void {
  const ngraphGraph = buildGraph(cytoscapeCollection, orgMetadata, package2MembersMap, includeSubscriberPackage);
  const gexfFile = gexf.save(ngraphGraph);
  fs.writeFileSync(fileName + '.gexf', gexfFile);
}

function buildGraph(
  cytoscapeCollection: cytoscape.CollectionReturnValue,
  orgMetadata: OrgMetadata,
  package2MembersMap?: Package2MembersMap,
  includeSubscriberPackage?: boolean
): Graph {
  const ngraphGraph = createGraph();

  cytoscapeCollection.nodes().forEach((cyNode) => {
    const nodeId = cyNode.id();
    const type = cyNode.attr('Type') as OrgMetadataTypeNames;
    const nodeMetadata = orgMetadata.get(type)?.get(nodeId) ?? { Label: nodeId, Type: type };
    let SubscriberPackageName;
    if (includeSubscriberPackage) {
      SubscriberPackageName = package2MembersMap?.get(nodeId);
    }
    const { Label, ...nodeAttributes } = convertFormats(nodeMetadata as OrgMetadataTypes);
    ngraphGraph.addNode(nodeId, {
      label: cleanGexf(Label),
      ...nodeAttributes,
      SubscriberPackageName,
    });
  });

  cytoscapeCollection.edges().forEach((cyEdge) => {
    const sourceNodeId = cyEdge.source().id();
    const targetNodeId = cyEdge.target().id();
    ngraphGraph.addLink(sourceNodeId, targetNodeId);
  });

  return ngraphGraph;
}

function convertFormats(nodeMetadata: OrgMetadataTypes): OrgMetadataTypes {
  const cleanNodeMetadata = Object.keys(nodeMetadata).map((key) => {
    if (typeof nodeMetadata[key as keyof OrgMetadataTypes] === 'string') {
      return [key as keyof OrgMetadataTypes, cleanGexf(nodeMetadata[key as keyof OrgMetadataTypes] as string)];
    }
    if (nodeMetadata[key as keyof OrgMetadataTypes] instanceof Date) {
      return [key as keyof OrgMetadataTypes, (nodeMetadata[key as keyof OrgMetadataTypes] as Date).toISOString()];
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
