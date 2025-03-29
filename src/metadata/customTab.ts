/*
 * Copyright (c) 2025, Juan Carlos Montero Lamata.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Connection } from '@salesforce/core';
import { ManageableState, OrgMetadataMap } from '../types/sObjects';

export async function queryCustomTabs(conn: Connection): Promise<OrgMetadataMap> {
  const customTabs = await conn.tooling.query(
    'SELECT Id, DeveloperName, Type, ManageableState, NamespacePrefix, CreatedDate, LastModifiedDate FROM CustomTab',
    {
      autoFetch: true,
    }
  );

  const metadatas = await conn.metadata.list([{ type: 'CustomTab', folder: null }]);

  return new Map(
    customTabs.records.map((record) => {
      let developerName = record.DeveloperName as string;
      if (record.Type === 'customObject') {
        developerName = metadatas.find((metadata) => metadata.id === record.Id)?.fullName ?? (record.Id as string);
      }
      return [
        record.Id as string,
        {
          Label: developerName,
          Type: 'CustomTab',
          DeveloperName: developerName,
          ManageableState: record.ManageableState as ManageableState,
          NamespacePrefix: record.NamespacePrefix as string,
          CreatedDate: new Date(record.CreatedDate as string),
          LastModifiedDate: new Date(record.LastModifiedDate as string),
        },
      ];
    })
  );
}
