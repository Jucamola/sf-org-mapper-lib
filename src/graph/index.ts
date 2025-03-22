/*
 * Copyright (c) 2025, Juan Carlos Montero Lamata.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import cytoscape = require('cytoscape');
import { MetadataComponentDependency, OrgMetadata } from '../types/SObjects';

export function buildGraph(
  orgMetadata: OrgMetadata,
  metadataComponentDependencies: MetadataComponentDependency[]
): cytoscape.Core {
  const graph = cytoscape();

  for (const orgMetadataMap of orgMetadata.values()) {
    for (const [id, nodeData] of orgMetadataMap.entries()) {
      graph.add({
        group: 'nodes',
        data: {
          id,
          Label: nodeData.Label,
          Type: nodeData.Type,
          isTest: nodeData?.IsTest,
        },
      });
    }
  }

  metadataComponentDependencies.forEach((edge) => {
    graph.add({ group: 'edges', data: { source: edge.MetadataComponentId, target: edge.RefMetadataComponentId } });
  });

  return graph;
}
