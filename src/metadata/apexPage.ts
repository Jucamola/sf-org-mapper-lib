/*
 * Copyright (c) 2025, Juan Carlos Montero Lamata.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Connection } from '@salesforce/core';
import { ManageableState, OrgMetadataMap } from '../types/SObjects';

export async function queryApexPages(conn: Connection): Promise<OrgMetadataMap> {
  const apexPages = await conn.tooling.query(
    `SELECT  Id, NamespacePrefix, Name, ApiVersion, LastModifiedDate, ManageableState
      FROM ApexPage`,
    {
      autoFetch: true,
    }
  );

  return new Map(
    apexPages.records.map((record) => [
      record.Id as string,
      {
        Label: record.Name as string,
        Type: 'ApexPage',
        ApiVersion: Number(record.ApiVersion),
        ManageableState: record.ManageableState as ManageableState,
        Name: record.Name as string,
        NamespacePrefix: record.NamespacePrefix as string,
        LastModifiedDate: new Date(record.LastModifiedDate as string),
      },
    ])
  );
}
