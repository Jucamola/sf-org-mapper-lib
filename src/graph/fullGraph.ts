/*
 * Copyright (c) 2025, Juan Carlos Montero Lamata.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import cytoscape = require('cytoscape');
import { Logger } from '@salesforce/core';
import { ApexClass, ManageableState, MetadataComponentDependency, OrgMetadata } from '../types/sObjects';

let logger: Logger;
const getLogger = (): Logger => {
  if (!logger) {
    logger = Logger.childFromRoot('buildGraph');
  }
  return logger;
};

export function buildGraph(
  orgMetadata: OrgMetadata,
  metadataComponentDependencies: MetadataComponentDependency[],
  options?: {
    manageableStates?: { include?: ManageableState[]; exclude?: ManageableState[] };
    namespacePrefixes?: { include?: string[]; exclude?: string[] };
  }
): cytoscape.Core {
  const manageableStatesToInclude = options?.manageableStates?.include;
  const manageableStatesToExclude = options?.manageableStates?.exclude;

  const namespacePrefixesToInclude = options?.namespacePrefixes?.include;
  const namespacePrefixesToExclude = options?.namespacePrefixes?.exclude;

  const graph = cytoscape();

  for (const orgMetadataMap of orgMetadata.values()) {
    for (const [id, nodeData] of orgMetadataMap.entries()) {
      if (manageableStatesToInclude && !manageableStatesToInclude.includes(nodeData.ManageableState)) {
        continue;
      }

      if (manageableStatesToExclude && manageableStatesToExclude.includes(nodeData.ManageableState)) {
        continue;
      }

      if (namespacePrefixesToInclude && !namespacePrefixesToInclude.includes(nodeData.NamespacePrefix)) {
        continue;
      }

      if (namespacePrefixesToExclude && namespacePrefixesToExclude.includes(nodeData.NamespacePrefix)) {
        continue;
      }

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
