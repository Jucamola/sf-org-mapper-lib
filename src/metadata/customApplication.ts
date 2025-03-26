/*
 * Copyright (c) 2025, Juan Carlos Montero Lamata.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Connection } from '@salesforce/core';
import { ManageableState, OrgMetadataMap } from '../types/sObjects';

export async function queryCustomApplications(conn: Connection): Promise<OrgMetadataMap> {
  const customApplications = await conn.tooling.query(
    'SELECT Id, Label, DeveloperName, NamespacePrefix, ManageableState, CreatedDate, LastModifiedDate FROM CustomApplication',
    {
      autoFetch: true,
    }
  );

  return new Map(
    customApplications.records.map((record) => [
      record.Id as string,
      {
        Label: record.DeveloperName as string,
        Type: 'CustomApplication',
        ManageableState: record.ManageableState as ManageableState,
        DeveloperName: record.DeveloperName as string,
        NamespacePrefix: record.NamespacePrefix as string,
        CreatedDate: new Date(record.CreatedDate as string),
        LastModifiedDate: new Date(record.LastModifiedDate as string),
      },
    ])
  );
}
