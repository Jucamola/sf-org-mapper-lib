/*
 * Copyright (c) 2025, Juan Carlos Montero Lamata.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Connection } from '@salesforce/core';
import { ManageableState, OrgMetadataMap } from '../types/sObjects';

export async function queryApexComponents(conn: Connection): Promise<OrgMetadataMap> {
  const apexComponents = await conn.tooling.query(
    `SELECT  Id, NamespacePrefix, Name, ApiVersion, CreatedDate, LastModifiedDate, ManageableState
      FROM ApexComponent`,
    {
      autoFetch: true,
    }
  );

  return new Map(
    apexComponents.records.map((record) => [
      record.Id as string,
      {
        Label: record.Name as string,
        Type: 'ApexComponent',
        ApiVersion: Number(record.ApiVersion),
        ManageableState: record.ManageableState as ManageableState,
        Name: record.Name as string,
        NamespacePrefix: record.NamespacePrefix as string,
        CreatedDate: new Date(record.CreatedDate as string),
        LastModifiedDate: new Date(record.LastModifiedDate as string),
      },
    ])
  );
}
