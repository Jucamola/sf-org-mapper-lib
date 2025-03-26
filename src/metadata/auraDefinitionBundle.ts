/*
 * Copyright (c) 2025, Juan Carlos Montero Lamata.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Connection } from '@salesforce/core';
import { ManageableState, OrgMetadataMap } from '../types/sObjects';

export async function queryAuraDefinitionBundles(conn: Connection): Promise<OrgMetadataMap> {
  const auraDefinitionBundles = await conn.tooling.query(
    'SELECT Id, DeveloperName, NamespacePrefix, ManageableState, LastModifiedDate, ApiVersion FROM AuraDefinitionBundle',
    {
      autoFetch: true,
    }
  );

  return new Map(
    auraDefinitionBundles.records.map((record) => [
      record.Id as string,
      {
        Label: record.DeveloperName as string,
        Type: 'AuraDefinitionBundle',
        ApiVersion: Number(record.ApiVersion),
        ManageableState: record.ManageableState as ManageableState,
        DeveloperName: record.DeveloperName as string,
        NamespacePrefix: record.NamespacePrefix as string,
        LastModifiedDate: new Date(record.LastModifiedDate as string),
      },
    ])
  );
}
