/*
 * Copyright (c) 2025, Juan Carlos Montero Lamata.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Connection } from '@salesforce/core';
import { ManageableState, OrgMetadataMap } from '../types/sObjects';

export async function queryLightningComponentBundles(conn: Connection): Promise<OrgMetadataMap> {
  const lightningComponentBundles = await conn.tooling.query(
    'SELECT Id, DeveloperName, NamespacePrefix, ManageableState, CreatedDate, LastModifiedDate, ApiVersion, IsExposed, TargetConfigs FROM LightningComponentBundle',
    {
      autoFetch: true,
    }
  );

  return new Map(
    lightningComponentBundles.records.map((record) => [
      record.Id as string,
      {
        Label: record.DeveloperName as string,
        Type: 'LightningComponentBundle',
        ApiVersion: Number(record.ApiVersion),
        ManageableState: record.ManageableState as ManageableState,
        DeveloperName: record.DeveloperName as string,
        NamespacePrefix: record.NamespacePrefix as string,
        CreatedDate: new Date(record.CreatedDate as string),
        LastModifiedDate: new Date(record.LastModifiedDate as string),
        IsExposed: record.IsExposed as boolean,
        TargetConfigs: record.TargetConfigs as string,
      },
    ])
  );
}
