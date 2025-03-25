/*
 * Copyright (c) 2025, Juan Carlos Montero Lamata.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import cytoscape = require('cytoscape');
import { Logger } from '@salesforce/core';
import { ApexClass, MetadataComponentDependency, OrgMetadata } from '../types/SObjects';

let logger: Logger;
const getLogger = (): Logger => {
  if (!logger) {
    logger = Logger.childFromRoot('buildGraph');
  }
  return logger;
};

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
          isTest: (nodeData as ApexClass)?.IsTest,
        },
      });
    }
  }

  metadataComponentDependencies.forEach((edge) => {
    try {
      graph.add({ group: 'edges', data: { source: edge.MetadataComponentId, target: edge.RefMetadataComponentId } });
    } catch (e) {
      if (e instanceof Error) {
        getLogger().warn(e.message);
      }
    }
  });

  return graph;
}
